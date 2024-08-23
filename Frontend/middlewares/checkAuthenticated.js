const checkAuthenticated = async (req, res, next) => {
    try {
      // Example: checking for a user ID in the request (e.g., from a token or session)
      const userId = req.userId; // Adjust based on your authentication mechanism
  
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      // Retrieve the user from the database (assuming `req.userId` is set)
      const user = await User.findOne({ where: { id: userId } });
  
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
  
      // Set the user information on the request object for later use
      req.user = user;
  
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export default checkAuthenticated;
  