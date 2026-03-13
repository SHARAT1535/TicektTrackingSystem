package admin

import (
	database "Ticket_Rising_Backend/Database"
	"encoding/json"
	"net/http"
)

func CreateReply(w http.ResponseWriter, r *http.Request) {
	var reply database.Reply

	err := json.NewDecoder(r.Body).Decode(&reply)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	database.InsertIntoReplies(reply)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reply)
}
