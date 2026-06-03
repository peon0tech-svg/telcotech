const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const outDir = path.join(__dirname, 'src', 'data');

function clean(str) {
  if (!str) return '';
  return str.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

// 4. Numbers
const numbersRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'numbers.json')));
const unifiedNumbers = [];

numbersRaw.forEach(gaz => {
  const gazette = gaz.gazette;
  const header = gaz.data.header.map(h => (h||'').toLowerCase());
  
  let numIdx = header.findIndex(h => h.includes('number') && !h.includes('weight') && !h.includes('fee'));
  if (numIdx === -1) numIdx = 0; // fallback

  let category = 'Numbers';
  if (header.join(' ').includes('short code') || header.join(' ').includes('shortcode')) category = 'Shortcodes';
  else if (header.join(' ').includes('toll free') || header.join(' ').includes('freephone')) category = 'Freephone';
  else if (header.join(' ').includes('msisdn') || header.join(' ').includes('mobile')) category = 'MSISDN Blocks';
  else if (header.join(' ').includes('digit numbers') || header.join(' ').includes('weight')) category = 'Number Fees';

  let licenseeIdx = header.findIndex(h => h.includes('licensee') || h.includes('applicant') || h.includes('provider'));
  let dateIdx = header.findIndex(h => h.includes('date'));

  gaz.data.rows.forEach(row => {
    let numberBlock = numIdx !== -1 ? clean(row[numIdx]) : '';
    if (!numberBlock || numberBlock.length < 2) return;
    if (numberBlock.toLowerCase().includes('discount') || numberBlock.toLowerCase().includes('less')) return;
    if (numberBlock.match(/^[0-9]+ - [0-9]+ : /)) return;
    
    // skip tv frequencies rows that ended up in numbers
    if (header.includes('site name') || header.includes('latitude')) return;

    let licensee = licenseeIdx !== -1 ? clean(row[licenseeIdx]) : '';
    let allocDate = dateIdx !== -1 ? clean(row[dateIdx]) : '';
    
    // if it's fees, skip for the executive table or categorize nicely
    if (category === 'Number Fees' && numberBlock.includes('Digit Numbers')) return;

    if (!licensee && !numberBlock.match(/[0-9]/)) return; // skip junk

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

console.log("Numbers Consolidation complete.");
