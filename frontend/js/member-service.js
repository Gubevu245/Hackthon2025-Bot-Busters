// Member Service
// This service is responsible for fetching member data from the backend

class MemberService {
  constructor(baseURL) {
    this.baseURL = baseURL || 'http://localhost:3000/api';
  }

  // Get total member count by summing member_count from all branches
  async getTotalMemberCount() {
    try {
      const response = await fetch(`${this.baseURL}/branches`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      
      const branches = await response.json();
      
      // Calculate total member count by summing member_count from all branches
      const totalMembers = branches.reduce((total, branch) => {
        return total + (branch.member_count || 0);
      }, 0);
      
      return totalMembers;
    } catch (error) {
      console.error('Error fetching total member count:', error);
      // Return a fallback value if the API call fails
      return 523; // Same fallback value as in index.js
    }
  }

  // Get all members from a specific branch
  async getMembersByBranch(branchId) {
    try {
      const response = await fetch(`${this.baseURL}/branches/${branchId}/users`);
      if (!response.ok) throw new Error(`Failed to fetch members for branch ${branchId}`);
      
      const members = await response.json();
      return members;
    } catch (error) {
      console.error(`Error fetching members for branch ${branchId}:`, error);
      return [];
    }
  }

  // Get all members across all branches
  async getAllMembers() {
    try {
      const response = await fetch(`${this.baseURL}/users`);
      if (!response.ok) throw new Error('Failed to fetch all members');
      
      const members = await response.json();
      return members;
    } catch (error) {
      console.error('Error fetching all members:', error);
      return [];
    }
  }
}

// Export the MemberService class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemberService;
}