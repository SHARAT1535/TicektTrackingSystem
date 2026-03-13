package admin

import (
	database "Ticket_Rising_Backend/Database"
	"encoding/json"
	"log"
	"net/http"
)

func AdminStarting() {

}

func CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var admin database.Admin

	err := json.NewDecoder(r.Body).Decode(&admin)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	database.InsertIntoAdmin(admin)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(admin)
}

func CreateDepartment(w http.ResponseWriter, r *http.Request) {
	var dept database.Department

	err := json.NewDecoder(r.Body).Decode(&dept)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	database.InsertIntoDepartment(&dept)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dept)
}

func VerifyAdminCredentials(w http.ResponseWriter, r *http.Request) {

	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")

	isValidAdmin, adminData := database.MatchAdminCredentials(username, password)

	response := map[string]interface{}{
		"success":        isValidAdmin,
		"id":             adminData.Id,
		"department_id":  adminData.Department_Id,
		"is_super_admin": adminData.IsSuperAdmin,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// This gets all tickets on the feed
func ViewAllTickets(w http.ResponseWriter, r *http.Request) {

	isSuperAdmin := r.URL.Query().Get("is_super_admin")
	departmentId := r.URL.Query().Get("department_id")
	sortBy := r.URL.Query().Get("sort_by")
	username := r.URL.Query().Get("username")

	log.Printf("ViewAllTickets requested: isSuperAdmin=%s, deptId=%s, sortBy=%s, username=%s", isSuperAdmin, departmentId, sortBy, username)

	var tickets []database.Ticket

	if isSuperAdmin == "true" {
		tickets = database.FetchAllTickets(sortBy, username)
	} else {
		tickets = database.FetchTicketsByDepartment(departmentId, sortBy, username)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func UpdateTicketStatus(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		TicketId int    `json:"ticket_id"`
		Status   string `json:"status"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = database.UpdateTicketStatus(requestData.TicketId, requestData.Status)
	if err != nil {
		http.Error(w, "Failed to update status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
