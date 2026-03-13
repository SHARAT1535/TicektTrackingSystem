package database

import (
	"database/sql"
	"log"
)

type User struct {
	Name     string `json:"name"`
	Id       int    `json:"id"`
	UserName string `json:"username"`
	Password string `json:"password"`
}

// This creates user table if user table does not exists
func CreateUserTable() {
	userTable := `CREATE TABLE IF NOT EXISTS users ( 
		id INT PRIMARY KEY AUTO_INCREMENT, 
		name VARCHAR(100) NOT NULL, 
		username VARCHAR(100) NOT NULL UNIQUE, 
		password VARCHAR(100) NOT NULL 
	)ENGINE=InnoDB;`

	_, err := Db.Exec(userTable)
	if err != nil {
		log.Fatal("Error creating user table: ", err)
	}
}

// This inserts user into users table
// func InsertIntoUser(u User) int64 {
// 	result, err := Db.Exec(
// 		"INSERT INTO users(name, username, password) VALUES(?,?,?)",
// 		u.Name, u.UserName, u.Password,
// 	)

// 	if err != nil {
// 		log.Fatal("Unable to insert user:", err)
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		log.Fatal("Unable to get inserted id:", err)
// 	}

// 	return id
// }

func InsertIntoUser(u *User) {

	result, err := Db.Exec(
		"INSERT INTO users(name, username, password) VALUES(?,?,?)",
		u.Name, u.UserName, u.Password,
	)

	if err != nil {
		log.Fatal("Unable to insert user:", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Fatal("Unable to get inserted id:", err)
	}

	u.Id = int(id)
}

// When user logins it checks if a user is registered in db
func MatchUserCredentials(username string, password string) (bool, int) {

	var user User

	err := Db.QueryRow(
		"SELECT id, name FROM users WHERE username=? AND password=?",
		username,
		password,
	).Scan(&user.Id, &user.Name)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, 0
		}
		log.Println("Database error:", err)
		return false, 0
	}

	return true, user.Id
}
