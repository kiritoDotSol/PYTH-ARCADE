fetch('https://hermes.pyth.network/v2/price_feeds').then(r => r.json()).then(data => {
  const oil = data.find(d => d.attributes.symbol.includes('WTI') || d.attributes.description.includes('OIL'));
  console.log('Oil:', oil?.id, oil?.attributes.symbol);
}).catch(console.error);
