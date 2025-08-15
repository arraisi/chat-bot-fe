<template>
  <div class="user-profile-card">
    <v-card class="mx-auto" max-width="400">
      <v-card-title>
        <v-icon left>mdi-account-circle</v-icon>
        User Profile
      </v-card-title>
      
      <v-card-text>
        <div v-if="isAuthenticated && userProfile">
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Name</v-list-item-title>
                <v-list-item-subtitle>{{ getUserDisplayName() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ getUserEmail() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Username</v-list-item-title>
                <v-list-item-subtitle>{{ currentUser }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Authority</v-list-item-title>
                <v-list-item-subtitle>{{ userAuthority }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            
            <v-list-item v-if="getUserRoles().length > 0">
              <v-list-item-content>
                <v-list-item-title>Roles</v-list-item-title>
                <div class="roles-container">
                  <v-chip
                    v-for="role in getUserRoles()"
                    :key="role"
                    small
                    color="primary"
                    class="ma-1"
                  >
                    {{ role }}
                  </v-chip>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          
          <!-- Authority-based content -->
          <v-divider class="my-4"></v-divider>
          
          <div class="authority-section">
            <h4>Authority-based Features</h4>
            
            <v-alert
              v-if="hasAuthority('hukum')"
              type="info"
              dense
              class="mb-2"
            >
              <v-icon left>mdi-gavel</v-icon>
              You have legal authority access
            </v-alert>
            
            <v-alert
              v-if="hasAnyAuthority(['admin departemen', 'super admin'])"
              type="success"
              dense
              class="mb-2"
            >
              <v-icon left>mdi-shield-crown</v-icon>
              You have administrative privileges
            </v-alert>
            
            <v-alert
              v-if="!hasAnyAuthority(['hukum', 'admin departemen', 'super admin'])"
              type="warning"
              dense
              class="mb-2"
            >
              <v-icon left>mdi-information</v-icon>
              Standard user access
            </v-alert>
          </div>
        </div>
        
        <div v-else>
          <v-alert type="error" dense>
            <v-icon left>mdi-alert-circle</v-icon>
            Not authenticated or missing user profile
          </v-alert>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="logout">
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const {
  isAuthenticated,
  currentUser,
  userAuthority,
  userProfile,
  logout,
  getUserDisplayName,
  getUserEmail,
  getUserRoles,
  hasAuthority,
  hasAnyAuthority,
} = useAuth();
</script>

<style scoped>
.user-profile-card {
  padding: 20px;
}

.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.authority-section {
  margin-top: 16px;
}

.authority-section h4 {
  margin-bottom: 12px;
  color: #1976d2;
}
</style>
