package database

import "log"

type Department struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func CreateDepartmentTable() {
	departmentTable := `
	CREATE TABLE IF NOT EXISTS department(
		id INT PRIMARY KEY AUTO_INCREMENT,
		name VARCHAR(100)
	);`
	_, err := Db.Exec(departmentTable)
	if err != nil {
		log.Fatal("Error creating category table", err)
	}
}

func InsertIntoDepartment(dept *Department) {
	result, err := Db.Exec("INSERT INTO department(name) VALUES(?)", dept.Name)
	if err != nil {
		log.Fatal("Unable to insert into department", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Fatal("Unable to get inserted department id:", err)
	}

	dept.Id = int(id)
}
