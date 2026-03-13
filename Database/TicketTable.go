package database

import (
	"context"
	"log"
)

type Ticket struct {
	Id            int    `json:"id"`
	Department_Id int    `json:"department_id"`
	Description   string `json:"description"`
	User_Id       int    `json:"user_id"`
	Status        string `json:"status"`
	Username      string `json:"username"`
	Priority      string `json:"priority"`
}

// This creats tickets table if not exists
func CreateTicketTable() {
	ticketTable := `
	CREATE TABLE IF NOT EXISTS tickets (
		id INT PRIMARY KEY AUTO_INCREMENT,
		department_id INT NOT NULL,
		description TEXT NOT NULL,
		status VARCHAR(50) DEFAULT 'Open',
		priority VARCHAR(50) DEFAULT 'Low',
		ticket_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		user_id INT,
		FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
	)ENGINE=InnoDB;`

	_, err := Db.Exec(ticketTable)
	if err != nil {
		log.Fatal("Error creating ticket table:", err)
	}

	// Add priority column if it doesn't already exist (we ignore the error if it already exists)
	Db.Exec("ALTER TABLE tickets ADD COLUMN priority VARCHAR(50) DEFAULT 'Low'")
}

// This inserts ticket into tickets table
func InsertIntoTickets(ticket *Ticket, userId int) {
	// Provide a default priority if none is given
	if ticket.Priority == "" {
		ticket.Priority = "Low"
	}

	result, err := Db.Exec(
		"INSERT INTO tickets(department_id,description,user_id,priority) VALUES(?,?,?,?)",
		ticket.Department_Id, ticket.Description, userId, ticket.Priority,
	)
	if err != nil {
		log.Fatal("Unable insert into tickets", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Fatal("Unable to get inserted id:", err)
	}

	ticket.Id = int(id)
}

func FetchTickets(ctx context.Context, userId int) []Ticket {

	rows, err := Db.QueryContext(ctx,
		`SELECT t.id, t.department_id, t.description, t.status, u.username, t.priority
		 FROM tickets t 
		 JOIN users u ON t.user_id = u.id 
		 WHERE t.user_id = ?
		 ORDER BY t.id ASC`,
		userId,
	)
	if err != nil {
		log.Println("Unable to fetch tickets:", err)
		return nil
	}
	defer rows.Close()

	var tickets []Ticket

	for rows.Next() {
		var ticket Ticket

		err := rows.Scan(
			&ticket.Id,
			&ticket.Department_Id,
			&ticket.Description,
			&ticket.Status,
			&ticket.Username,
			&ticket.Priority,
		)

		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		tickets = append(tickets, ticket)
	}

	return tickets
}

// Fetches all tickets from database for admins with optional username and priority filters
func FetchAllTickets(priorityFilter string, usernameFilter string) []Ticket {
	query := `SELECT t.id, t.department_id, t.description, t.user_id, t.status, u.username, t.priority 
			 FROM tickets t 
			 JOIN users u ON t.user_id = u.id 
			 WHERE 1=1`

	var args []interface{}

	if usernameFilter != "" {
		query += " AND u.username LIKE ?"
		args = append(args, "%"+usernameFilter+"%")
	}

	if priorityFilter == "High" || priorityFilter == "Medium" || priorityFilter == "Low" {
		query += " AND t.priority = ?"
		args = append(args, priorityFilter)
	}

	query += " ORDER BY t.id DESC"

	log.Printf("Executing FetchAllTickets: query=%s, args=%v", query, args)

	rows, err := Db.Query(query, args...)
	if err != nil {
		log.Println("Unable to fetch all tickets:", err)
		return nil
	}
	defer rows.Close()

	var tickets []Ticket

	for rows.Next() {
		var ticket Ticket

		err := rows.Scan(
			&ticket.Id,
			&ticket.Department_Id,
			&ticket.Description,
			&ticket.User_Id,
			&ticket.Status,
			&ticket.Username,
			&ticket.Priority,
		)

		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		tickets = append(tickets, ticket)
	}

	return tickets
}

// Fetches tickets specific to a department with optional username and priority filters
func FetchTicketsByDepartment(deptId string, priorityFilter string, usernameFilter string) []Ticket {
	query := `SELECT t.id, t.department_id, t.description, t.user_id, t.status, u.username, t.priority 
		 FROM tickets t 
		 JOIN users u ON t.user_id = u.id 
		 WHERE t.department_id = ?`

	var args []interface{}
	args = append(args, deptId)

	if usernameFilter != "" {
		query += " AND u.username LIKE ?"
		args = append(args, "%"+usernameFilter+"%")
	}

	if priorityFilter == "High" || priorityFilter == "Medium" || priorityFilter == "Low" {
		query += " AND t.priority = ?"
		args = append(args, priorityFilter)
	}

	query += " ORDER BY t.id ASC"

	rows, err := Db.Query(query, args...)
	if err != nil {
		log.Println("Unable to fetch department tickets:", err)
		return nil
	}
	defer rows.Close()

	var tickets []Ticket

	for rows.Next() {
		var ticket Ticket

		err := rows.Scan(
			&ticket.Id,
			&ticket.Department_Id,
			&ticket.Description,
			&ticket.User_Id,
			&ticket.Status,
			&ticket.Username,
			&ticket.Priority,
		)

		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		tickets = append(tickets, ticket)
	}

	return tickets
}

// Updates the status of a specific ticket
func UpdateTicketStatus(ticketId int, status string) error {
	_, err := Db.Exec(
		"UPDATE tickets SET status = ? WHERE id = ?",
		status, ticketId,
	)
	if err != nil {
		log.Println("Failed to update ticket status:", err)
		return err
	}
	return nil
}
