class MockAPI {
  static users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', joinDate: '2024-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'inactive', joinDate: '2024-03-10' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', status: 'active', joinDate: '2024-03-15' },
  ];

  static articles = [
    { id: 1, title: 'AI Revolution in 2024', author: 'John Doe', category: 'Technology', status: 'published', date: '2024-03-20' },
    { id: 2, title: 'Climate Change Updates', author: 'Jane Smith', category: 'Environment', status: 'pending', date: '2024-03-19' },
    { id: 3, title: 'Stock Market Analysis', author: 'Mike Johnson', category: 'Finance', status: 'published', date: '2024-03-18' },
    { id: 4, title: 'Health Tips for Spring', author: 'Sarah Williams', category: 'Health', status: 'pending', date: '2024-03-17' },
  ];

  static keywords = [
    { id: 1, word: 'Coffee', searches: 195, trend: 'up' },
    { id: 2, word: 'Sports', searches: 90, trend: 'down' },
    { id: 3, word: 'News', searches: 330, trend: 'up' },
    { id: 4, word: 'Tea', searches: 56, trend: 'stable' },
    { id: 5, word: 'Burger', searches: 35, trend: 'up' },
  ];

  static analytics = {
    newsStats: { real: 156, fake: 43, underReview: 28 },
    weeklyData: [
      { day: 'Mon', real: 18, fake: 5, underReview: 3 },
      { day: 'Tue', real: 22, fake: 7, underReview: 4 },
      { day: 'Wed', real: 25, fake: 6, underReview: 5 },
      { day: 'Thu', real: 20, fake: 8, underReview: 4 },
      { day: 'Fri', real: 28, fake: 6, underReview: 5 },
      { day: 'Sat', real: 23, fake: 6, underReview: 4 },
      { day: 'Sun', real: 20, fake: 5, underReview: 3 },
    ],
    monthlyTrend: [
      { month: 'Jan', real: 120, fake: 35, underReview: 22 },
      { month: 'Feb', real: 135, fake: 38, underReview: 24 },
      { month: 'Mar', real: 156, fake: 43, underReview: 28 },
    ],
  };

  static notifications = [
    { id: 1, source: 'BBC', message: 'Welcome to your notification center', time: '2h ago' },
  ];

  static settings = {
    pushNotification: true,
    emailNotification: false,
    inAppNotification: false,
    language: 'English',
    timezone: 'Islamabad',
  };

  static categories = [];
  static connections = [];

  static getUsers() { return Promise.resolve([...this.users]); }
  static createUser(user) {
    const newUser = { ...user, id: this.users.length + 1, joinDate: new Date().toISOString().split('T')[0] };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }
  static updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return Promise.resolve(this.users[index]);
    }
    return Promise.reject('User not found');
  }
  static deleteUser(id) {
    this.users = this.users.filter(u => u.id !== id);
    return Promise.resolve({ success: true });
  }
  static getArticles() { return Promise.resolve([...this.articles]); }
  static createArticle(article) {
    const newArticle = { ...article, id: this.articles.length + 1, date: new Date().toISOString().split('T')[0] };
    this.articles.push(newArticle);
    return Promise.resolve(newArticle);
  }
  static updateArticle(id, updates) {
    const index = this.articles.findIndex(a => a.id === id);
    if (index !== -1) {
      this.articles[index] = { ...this.articles[index], ...updates };
      return Promise.resolve(this.articles[index]);
    }
    return Promise.reject('Article not found');
  }
  static deleteArticle(id) {
    this.articles = this.articles.filter(a => a.id !== id);
    return Promise.resolve({ success: true });
  }
  static getKeywords() { return Promise.resolve([...this.keywords]); }
  static getAnalytics() { return Promise.resolve({...this.analytics}); }
  static getNotifications() { return Promise.resolve([...this.notifications]); }
  static getSettings() { return Promise.resolve({...this.settings}); }
  static updateSettings(updates) {
    this.settings = {...this.settings, ...updates};
    return Promise.resolve(this.settings);
  }
  static getCategories() { return Promise.resolve([...this.categories]); }
  static addCategory(category) {
    const newCategory = { id: this.categories.length + 1, name: category };
    this.categories.push(newCategory);
    return Promise.resolve(newCategory);
  }
  static removeCategory(id) {
    this.categories = this.categories.filter(c => c.id !== id);
    return Promise.resolve({ success: true });
  }
  static getConnections() { return Promise.resolve([...this.connections]); }
  static addConnection(connection) {
    const newConnection = { id: this.connections.length + 1, name: connection };
    this.connections.push(newConnection);
    return Promise.resolve(newConnection);
  }
  static removeConnection(id) {
    this.connections = this.connections.filter(c => c.id !== id);
    return Promise.resolve({ success: true });
  }
}

export default MockAPI;