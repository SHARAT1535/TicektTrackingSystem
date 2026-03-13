package database

import (
	"log"
)

type Reply struct {
	Id        int    `json:"id"`
	Comment   string `json:"comment"`
	Ticket_Id int    `json:"ticket_id"`
}

func CreateRepliesTable() {
	repliesTable := `
	CREATE TABLE IF NOT EXISTS replies(
		id INT PRIMARY KEY AUTO_INCREMENT,
		comment VARCHAR(200) NOT NULL,
		ticket_id INT,
		FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE
	)ENGINE=InnoDB;`

	_, err := Db.Exec(repliesTable)
	if err != nil {
		log.Fatal("Error creating user table: ", err)
	}
}

func InsertIntoReplies(reply Reply) {
	_, err := Db.Exec(
		"INSERT INTO replies(comment, ticket_id) VALUES(?,?)",
		reply.Comment, reply.Ticket_Id,
	)

	if err != nil {
		log.Fatal("Unable to insert into replies", err)
	}
}

func FetchReplies(userId int) []Reply {

	rows, err := Db.Query(
		`SELECT comment, ticket_id
		 FROM replies
		 WHERE ticket_id IN (
			 SELECT id FROM tickets WHERE user_id = ?
		 )`,
		userId,
	)

	if err != nil {
		log.Println("Unable to fetch replies:", err)
		return nil
	}
	defer rows.Close()

	var replies []Reply

	for rows.Next() {
		var reply Reply

		err := rows.Scan(
			&reply.Comment,
			&reply.Ticket_Id,
		)

		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		replies = append(replies, reply)
	}

	return replies
}

func FetchRepliesByTicket(ticketId int) []Reply {
	rows, err := Db.Query(
		"SELECT id, comment, ticket_id FROM replies WHERE ticket_id = ?",
		ticketId,
	)

	if err != nil {
		log.Println("Unable to fetch replies by ticket:", err)
		return nil
	}
	defer rows.Close()

	var replies []Reply

	for rows.Next() {
		var reply Reply

		err := rows.Scan(
			&reply.Id,
			&reply.Comment,
			&reply.Ticket_Id,
		)

		if err != nil {
			log.Println("Scan error:", err)
			continue
		}

		replies = append(replies, reply)
	}

	return replies
}
