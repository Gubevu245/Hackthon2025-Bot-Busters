// Database connector class
class DatabaseConnector {
  constructor(baseURL) {
    this.baseURL = baseURL || 'http://localhost:3000/api';
    this.memberService = new MemberService(this.baseURL);
  }

  // Get stats data from API
  async getStats() {
    try {
      // Get total member count using MemberService
      const totalMembers = await this.memberService.getTotalMemberCount();

      // Get count of branches
      const branchesResponse = await fetch(`${this.baseURL}/branches`);
      if (!branchesResponse.ok) throw new Error('Failed to fetch branches');
      const branches = await branchesResponse.json();

      // Get count of events
      const eventsResponse = await fetch(`${this.baseURL}/events`);
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      const events = await eventsResponse.json();

      // Return stats data
      return {
        members: totalMembers,
        branches: branches.length,
        events: events.length,
        years: 24, // This is a static value for now
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data if API call fails
      return {
        members: 523,
        branches: 17,
        events: 56,
        years: 24,
      };
    }
  }

  // Get news from API
  async getNews() {
    try {
      const response = await fetch(`${this.baseURL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');

      const newsData = await response.json();

      // Transform API data to match expected format
      return newsData.map(item => ({
        id: item.id,
        title: item.title,
        category: item.status || 'News',
        scope: item.is_featured ? 'Featured' : '',
        author: item.author ? item.author.name : 'NaTeSA',
        date: item.publish_date,
        content: item.content
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to mock data if API call fails
      return [
        {
          id: 1,
          title: "NaTeSA Annual Conference 2024",
          category: "Events",
          scope: "National",
          author: "NEC Committee",
          date: "2024-03-15",
          content: "Join us for our annual conference featuring keynote speakers and networking opportunities."
        },
        {
          id: 2,
          title: "New Scholarship Program Launched",
          category: "Announcements",
          scope: "National",
          author: "NEC Committee",
          date: "2024-03-10",
          content: "We're excited to announce our new scholarship program for outstanding students."
        },
        {
          id: 3,
          title: "Branch Leadership Training",
          category: "Training",
          author: "NEC Committee",
          date: "2024-03-05",
          content: "Leadership training sessions for BEC members across all branches."
        }
      ];
    }
  }

  // Get events from API
  async getEvents() {
    try {
      const response = await fetch(`${this.baseURL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');

      const eventsData = await response.json();

      // Transform API data to match expected format
      return eventsData.map(item => ({
        id: item.id,
        title: item.title,
        type: item.event_type || 'Event',
        date: item.date,
        location: item.location || 'TBD'
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data if API call fails
      return [
        {
          id: 1,
          title: "Career Guidance Workshop",
          type: "Workshop",
          date: "2024-04-20",
          location: "University of KwaZulu-Natal"
        },
        {
          id: 2,
          title: "Community Service Day",
          type: "Community Service",
          date: "2024-04-25",
          location: "Various Locations"
        },
        {
          id: 3,
          title: "Academic Excellence Awards",
          type: "Awards Ceremony",
          date: "2024-05-10",
          location: "Durban ICC"
        }
      ];
    }
  }
}

// Function to update the stats section with data from the database
function updateStatsSection(statsData) {
  // Remove loading class and update values
  document.getElementById('members-count').textContent = statsData.members + '+';
  document.getElementById('members-count').classList.remove('loading');

  document.getElementById('branches-count').textContent = statsData.branches;
  document.getElementById('branches-count').classList.remove('loading');

  document.getElementById('events-count').textContent = statsData.events + '+';
  document.getElementById('events-count').classList.remove('loading');

  document.getElementById('years-count').textContent = statsData.years;
  document.getElementById('years-count').classList.remove('loading');
}

// Function to update news section
function updateNewsSection(newsData) {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';

  newsData.forEach(newsItem => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';

    let tagsHtml = `<span class="tag ${getTagColor(newsItem.category)}">${newsItem.category}</span>`;
    if (newsItem.scope) {
      tagsHtml += `<span class="tag purple">${newsItem.scope}</span>`;
    }

    newsCard.innerHTML = `
      ${tagsHtml}
      <h3>${newsItem.title}</h3>
      <h4>By ${newsItem.author} - ${formatDate(newsItem.date)}</h4>
      <p>${newsItem.content}</p>
    `;

    newsContainer.appendChild(newsCard);
  });
}

// Function to update events section
function updateEventsSection(eventsData) {
  const eventsContainer = document.getElementById('events-container');
  eventsContainer.innerHTML = '';

  eventsData.forEach(eventItem => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';

    eventCard.innerHTML = `
      <span class="tag ${getTagColor(eventItem.type)}">${eventItem.type}</span>
      <h3>${eventItem.title}</h3>
      <p>${formatDate(eventItem.date)} - ${eventItem.location}</p>
    `;

    eventsContainer.appendChild(eventCard);
  });
}

// Helper function to get tag color based on category
function getTagColor(category) {
  switch(category.toLowerCase()) {
    case 'events':
    case 'workshop':
      return 'blue';
    case 'announcements':
    case 'community service':
      return 'green';
    case 'training':
    case 'awards ceremony':
      return 'purple';
    default:
      return 'blue';
  }
}

// Helper function to format dates
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to handle errors and keep placeholder values
function handleStatsError(error) {
  console.error('Failed to load stats from database:', error);

  // Remove loading indicators but keep placeholder values
  document.getElementById('members-count').classList.remove('loading');
  document.getElementById('branches-count').classList.remove('loading');
  document.getElementById('events-count').classList.remove('loading');
  document.getElementById('years-count').classList.remove('loading');
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
  });

  const db = new DatabaseConnector();

  // Fetch stats from database
  db.getStats()
    .then(statsData => {
      updateStatsSection(statsData);
    })
    .catch(error => {
      handleStatsError(error);
    });

  // Fetch news from database
  db.getNews()
    .then(newsData => {
      updateNewsSection(newsData);
    })
    .catch(error => {
      console.error('Failed to load news:', error);
    });

  // Fetch events from database
  db.getEvents()
    .then(eventsData => {
      updateEventsSection(eventsData);
    })
    .catch(error => {
      console.error('Failed to load events:', error);
    });
});
