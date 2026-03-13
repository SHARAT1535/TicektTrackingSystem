package user

import (
	database "Ticket_Rising_Backend/Database"
	"encoding/json"
	"net/http"
)

// This is nothing but user registration
func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user database.User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	database.InsertIntoUser(&user) // Insert user into users table

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Function to verify user
func VerifyUserCredentials(w http.ResponseWriter, r *http.Request) {

	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")

	isValidUser, userId := database.MatchUserCredentials(username, password)

	response := map[string]interface{}{
		"success": isValidUser,
		"id":      userId,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
