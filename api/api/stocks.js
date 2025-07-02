export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const symbols = req.query.symbols || 'AAPL,GOOGL,TSLA';
  
  try {
    // Try Finnhub (free tier, get key at finnhub.io)
    if (process.env.FINNHUB_API_KEY) {
      const symbolArray = symbols.split(',');
      const promises = symbolArray.map(symbol =>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`)
          .then(res => res.json())
          .then(data => ({ symbol, ...data }))
      );
      
      const results = await Promise.all(promises);
      res.status(200).json({ results, source: 'finnhub' });
      return;
    }

    // If no API key, return error
    res.status(500).json({ 
      error: 'No stock API keys configured. Please add FINNHUB_API_KEY to environment variables.' 
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
