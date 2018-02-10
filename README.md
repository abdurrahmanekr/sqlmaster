# sqlmaster
SQL string maker.

### Install

```
npm install sqlmaster --save
```
```javascript
const SQLMaster = require('sqlmaster');

SQLMaster.init({
    prepareType: '$',
})

// prepareType: '$'   => SELECT * FROM users WHERE id = $1
// prepareType: 'tag' => SELECT * FROM users WHERE id = :id
```

- [exec](#exec)
- [from](#from)
- [select](#select)
- [where](#where)
- [groupBy](#groupBy)
- [orderBy](#orderBy)
- [desc](#desc)
- [asc](#asc)
- [limit](#limit)
- [insert](#insert)
- [update](#update)
- [delete](#delete)

## exec
It returns the output of the entire query.

```javascript
SQLMaster
.from('users')
.delete()
.where('id = :id', {
    ':id': 65536
})
.exec()

/*
{
    text: 'DELETE FROM users WHERE id = $1',
    values: [
        65536
    ]
}
*/
```

## from
It sets the query's master table.

```javascript
SQLMaster.from('users')
```

## select
It sets the query's 'select params'.

```javascript
SQLMaster
.from('users')
.select([
    "name",
    ["email", "RTRIM(email)"],
    ["count", "COUNT(*)"],
])

// SELECT name, RTRIM(email) AS email, COUNT(*) AS count FROM users
```

## where
It sets the query's 'where'.

```javascript
SQLMaster
.from('users')
.where("id = :id", {
    ':id': 65536
})
.select([
    "*",
])

// SELECT name, RTRIM(email) AS email, COUNT(*) AS count FROM users WHERE id = $1
```

## groupBy
It sets the query's 'group by'.

```javascript
SQLMaster
.from('users')
.groupBy('name, email')
.select([
    "name",
    [ "email", "RTRIM(email)"],
    ["count", "COUNT(*)"]
])

// SELECT name, RTRIM(email) AS email, COUNT(*) AS count FROM users GROUP BY name, email
```

## orderBy
It sets the query's 'order by'.

```javascript
SQLMaster
.from('users')
.orderBy('name, email')
.select([
    "name",
    [ "email", "RTRIM(email)"],
])

// SELECT name, RTRIM(email) AS email, COUNT(*) AS count FROM users GROUP BY name, email
```

## desc
It sets the query's 'order by desc'.

```javascript
SQLMaster
.from('users')
.orderBy('name, email')
.desc()
.select([
    "*"
])

// SELECT * FROM users ORDER BY name, email DESC
```

## asc
It sets the query's 'order by asc'.

```javascript
SQLMaster
.from('users')
.orderBy('name, email')
.asc()
.select([
    "*"
])

// SELECT * FROM users ORDER BY name, email ASC
```

## limit
It sets the query's 'limit'.

```javascript
SQLMaster
.from('users')
.orderBy('name, email')
.desc()
.select([
    "*"
])

// SELECT * FROM users LIMIT 200
```

## insert
It sets the query's 'insert'.

```javascript
SQLMaster
.from('users')
.insert({
    name: "GitHub Support",
    email: "support@github.com",
    date: new Date(),
})

// INSERT INTO users (name, email, date) VALUES($1, $2, $3)
```

## update
It sets the query's 'update'.

```javascript
SQLMaster
.from('users')
.update({
    name: "GitHub Support",
    email: "support@github.com",
    date: new Date(),
})
.where('id = :id', {
    ':id': 65536
})

// UPDATE users SET name = $1, email = $2, date = $3 WHERE id = $4
```

## delete
It sets the query's 'delete'.

```javascript
SQLMaster
.from('users')
.delete()
.where('id = :id', {
    ':id': 65536
})

// DELETE FROM users WHERE id = $1
```
