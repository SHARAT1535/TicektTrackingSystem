package database

import (
	"database/sql"
	"log"
)

var Db *sql.DB

func CheckIfDbExists() {
	Db, err := sql.Open("mysql", "root:macbook@123@tcp(127.0.0.1:3306)/")
	if err != nil {
		log.Fatal(err)
	}

	err = Db.Ping() // Checks whether the database is reachable,
	// Verifies that the connection is valid, Actually attempts to establish a connection if one hasn’t been made yet
	if err != nil {
		log.Fatal(err)
	}

	_, err = Db.Exec("CREATE DATABASE IF NOT EXISTS ticket_rising_db")
	if err != nil {
		log.Fatal("Error creating database:", err)
	}

	Db.Close()
}

func ConnectDb() {
	db, err := sql.Open("mysql", "root:macbook@123@tcp(127.0.0.1:3306)/ticket_rising_db")
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping() // tests the connection
	if err != nil {
		log.Fatal(err)
	}

	Db = db
}
