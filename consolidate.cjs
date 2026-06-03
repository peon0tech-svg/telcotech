const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const outDir = path.join(__dirname, 'src', 'data');

function clean(str) {
  if (!str) return '';
  return str.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Telecom
const telecomRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'telecomLicenses.json')));
const unifiedTelecom = [];

telecomRaw.forEach(gaz => {
  const gazette = gaz.gazette;
  const header = gaz.data.header.map(h => h.toLowerCase());
  
  let nameIdx = header.findIndex(h => h.includes('licensee') || h.includes('applicant'));
  let typeIdx = header.findIndex(h => h.includes('type of telecommunications') || h.includes('type of licence') || h.includes('service license'));
  let expIdx = header.findIndex(h => h.includes('expiry') || h.includes('date'));
  let detailsIdx = header.findIndex(h => h.includes('citizenship') || h.includes('percentage'));

  if (nameIdx === -1) nameIdx = 1; // usually column 1 is licensee if 0 is No.

  gaz.data.rows.forEach(row => {
    if (!row[nameIdx]) return;
    const companyName = clean(row[nameIdx]);
    if (companyName.toLowerCase() === 'licensee' || companyName.match(/^\d+$/) || companyName.length < 2) return;
    
    let type = typeIdx !== -1 ? clean(row[typeIdx]) : '';
    let exp = expIdx !== -1 ? clean(row[expIdx]) : '';
    let details = detailsIdx !== -1 ? clean(row[detailsIdx]) : '';

    // some fallback
    if (!type && row.length > 2) type = clean(row[2]);

    unifiedTelecom.push({
      companyName,
      licenseType: type,
      dateApprovedExpiry: exp,
      keyDetails: details,
      gazetteRef: gazette
    });
  });
});
fs.writeFileSync(path.join(outDir, 'unified_telecom.json'), JSON.stringify(unifiedTelecom, null, 2));

// 2. Broadcasting
const broadcastRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'broadcastingLicenses.json')));
const unifiedBroadcasting = [];

broadcastRaw.forEach(gaz => {
  const gazette = gaz.gazette;
  const header = gaz.data.header.map(h => h.toLowerCase());
  
  let nameIdx = header.findIndex(h => h.includes('licensee') || h.includes('applicant') || h.includes('person'));
  let typeIdx = header.findIndex(h => h.includes('type of broadcasting') || h.includes('service license') || h.includes('category'));
  let expIdx = header.findIndex(h => h.includes('expiry') || h.includes('date'));
  let detailsIdx = header.findIndex(h => h.includes('citizenship') || h.includes('percentage'));

  if (nameIdx === -1) nameIdx = 1;

  gaz.data.rows.forEach(row => {
    if (!row[nameIdx]) return;
    const companyName = clean(row[nameIdx]);
    if (companyName.toLowerCase() === 'licensee' || companyName.match(/^\d+$/) || companyName.length < 2) return;
    
    let type = typeIdx !== -1 ? clean(row[typeIdx]) : '';
    let exp = expIdx !== -1 ? clean(row[expIdx]) : '';
    let details = detailsIdx !== -1 ? clean(row[detailsIdx]) : '';

    unifiedBroadcasting.push({
      companyName,
      licenseType: type,
      dateApprovedExpiry: exp,
      keyDetails: details,
      gazetteRef: gazette
    });
  });
});
fs.writeFileSync(path.join(outDir, 'unified_broadcasting.json'), JSON.stringify(unifiedBroadcasting, null, 2));

// 3. Spectrum
const spectrumRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'spectrumLicenses.json')));
const unifiedSpectrum = [];

spectrumRaw.forEach(gaz => {
  const gazette = gaz.gazette;
  const header = gaz.data.header.map(h => h.toLowerCase());
  
  let freqIdx = header.findIndex(h => h.includes('frequenc'));
  let nameIdx = header.findIndex(h => h.includes('licensee') || h.includes('applicant'));
  let useIdx = header.findIndex(h => h.includes('service') && (h.includes('provide') || h.includes('use')));
  let dateIdx = header.findIndex(h => h.includes('date'));

  gaz.data.rows.forEach(row => {
    let freq = freqIdx !== -1 ? clean(row[freqIdx]) : '';
    if (!freq) {
        // sometimes frequency is the 5th column
        if (row.length > 5 && (row[5] || '').match(/\d/)) freq = clean(row[5]);
        else if (row.length > 2 && (row[2] || '').match(/\d/)) freq = clean(row[2]);
    }
    if (!freq || freq.length < 3) return;

    let licensee = nameIdx !== -1 ? clean(row[nameIdx]) : (row[1] ? clean(row[1]) : '');
    let use = useIdx !== -1 ? clean(row[useIdx]) : '';
    let date = dateIdx !== -1 ? clean(row[dateIdx]) : '';

    unifiedSpectrum.push({
      radioFrequencyRange: freq,
      licensee,
      typeOfUse: use,
      dateAllocated: date,
      gazetteRef: gazette
    });
  });
});
fs.writeFileSync(path.join(outDir, 'unified_spectrum.json'), JSON.stringify(unifiedSpectrum, null, 2));

// 4. Numbers
const numbersRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'numbers.json')));
const unifiedNumbers = [];

numbersRaw.forEach(gaz => {
  const gazette = gaz.gazette;
  const header = gaz.data.header.map(h => (h||'').toLowerCase());
  
  let numIdx = header.findIndex(h => h.includes('number') && !h.includes('weight') && !h.includes('fee'));
  if (numIdx === -1) numIdx = 0; // fallback

  let category = 'Unknown';
  if (header.join(' ').includes('short code') || header.join(' ').includes('shortcode')) category = 'Shortcodes';
  else if (header.join(' ').includes('toll free') || header.join(' ').includes('freephone')) category = 'Freephone';
  else if (header.join(' ').includes('msisdn') || header.join(' ').includes('mobile')) category = 'MSISDN Blocks';
  else if (header.join(' ').includes('digit numbers') || header.join(' ').includes('weight')) category = 'Number Fees';

  let licenseeIdx = header.findIndex(h => h.includes('licensee') || h.includes('applicant') || h.includes('provider'));
  let dateIdx = header.findIndex(h => h.includes('date'));

  gaz.data.rows.forEach(row => {
    let numberBlock = numIdx !== -1 ? clean(row[numIdx]) : '';
    if (!numberBlock || numberBlock.length < 2) return;
    
    // skip tv frequencies rows that ended up in numbers
    if (header.includes('site name') || header.includes('latitude')) return;

    let licensee = licenseeIdx !== -1 ? clean(row[licenseeIdx]) : '';
    let allocDate = dateIdx !== -1 ? clean(row[dateIdx]) : '';

    unifiedNumbers.push({
      category,
      numberBlock,
      licensee,
      allocationDate: allocDate,
      gazetteRef: gazette
    });
  });
});
fs.writeFileSync(path.join(outDir, 'unified_numbers.json'), JSON.stringify(unifiedNumbers, null, 2));

console.log("Consolidation complete.");
