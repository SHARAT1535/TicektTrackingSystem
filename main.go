package main

import (
	admin "Ticket_Rising_Backend/Admin"
	database "Ticket_Rising_Backend/Database"
	user "Ticket_Rising_Backend/User"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

func main() {

	db() // Database
	
	// Backend (API) Server - Port 8080
	apiMux := http.NewServeMux()
	apiMux.HandleFunc("/createUserAccount", user.CreateUser)           // to create user account
	apiMux.HandleFunc("/userLogin", user.VerifyUserCredentials)        // user login
	apiMux.HandleFunc("/raiseTicket", user.CreateTicket)               // raise a ticket
	apiMux.HandleFunc("/viewTickets", user.ViewTickets)                // view tickets
	apiMux.HandleFunc("/viewReplies", user.Viewreplies)                // view replies
	apiMux.HandleFunc("/createAdmin", admin.CreateAdmin)               // create admin account
	apiMux.HandleFunc("/createDepartment", admin.CreateDepartment)     // create department account
	apiMux.HandleFunc("/createReply", admin.CreateReply)               // create reply
	apiMux.HandleFunc("/adminLogin", admin.VerifyAdminCredentials)     // admin login
	apiMux.HandleFunc("/viewAllTickets", admin.ViewAllTickets)         // view all tickets for admins
	apiMux.HandleFunc("/updateTicketStatus", admin.UpdateTicketStatus) // update ticket status
	
	apiHandler := corsMiddleware(apiMux)

	// Frontend Server - Port 3030
	staticMux := http.NewServeMux()
	staticMux.Handle("/", http.FileServer(http.Dir("./Frontend")))

	// Start Frontend Server in a goroutine
	go func() {
		log.Println("Frontend running on http://localhost:3030")
		if err := http.ListenAndServe(":3030", staticMux); err != nil {
			log.Fatal("Frontend server failed:", err)
		}
	}()

	// Start Backend Server
	log.Println("Backend API running on http://localhost:8080")
	err := http.ListenAndServe(":8080", apiHandler)
	if err != nil {
		log.Fatal("Backend server failed:", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func db() {
	database.CheckIfDbExists() // checks if db exists if not creates one
	database.ConnectDb()       // connects to the db

	database.CreateUserTable()       // creats user table if it does not exist
	database.CreateDepartmentTable() // creats department table if it does not exist
	database.CreateAdminTable()      // creats admin table if it does not exist
	database.CreateTicketTable()     // creats ticket table if it does not exist
	database.CreateRepliesTable()    // creats replies table if it does not exist
	fmt.Println("Created and connected to database")
}
