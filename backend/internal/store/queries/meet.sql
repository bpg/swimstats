-- name: GetMeet :one
SELECT id, name, city, country, date, course_type, created_at, updated_at
FROM meets
WHERE id = $1;

-- name: ListMeets :many
SELECT 
    m.id, 
    m.name, 
    m.city, 
    m.country, 
    m.date, 
    m.course_type, 
    m.created_at, 
    m.updated_at,
    COUNT(t.id)::int AS time_count
FROM meets m
LEFT JOIN times t ON t.meet_id = m.id
WHERE ($1::varchar = '' OR m.course_type = $1)
GROUP BY m.id
ORDER BY m.date DESC
LIMIT $2 OFFSET $3;

-- name: CountMeets :one
SELECT COUNT(*) FROM meets
WHERE ($1::varchar = '' OR course_type = $1);

-- name: CreateMeet :one
INSERT INTO meets (name, city, country, date, course_type)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, name, city, country, date, course_type, created_at, updated_at;

-- name: UpdateMeet :one
UPDATE meets
SET name = $2, city = $3, country = $4, date = $5, course_type = $6
WHERE id = $1
RETURNING id, name, city, country, date, course_type, created_at, updated_at;

-- name: DeleteMeet :exec
DELETE FROM meets
WHERE id = $1;

-- name: GetMeetWithTimeCount :one
SELECT 
    m.id, 
    m.name, 
    m.city, 
    m.country, 
    m.date, 
    m.course_type, 
    m.created_at, 
    m.updated_at,
    COUNT(t.id)::int AS time_count
FROM meets m
LEFT JOIN times t ON t.meet_id = m.id
WHERE m.id = $1
GROUP BY m.id;

-- name: GetRecentMeets :many
SELECT 
    m.id, 
    m.name, 
    m.city, 
    m.country, 
    m.date, 
    m.course_type, 
    m.created_at, 
    m.updated_at,
    COUNT(t.id)::int AS time_count
FROM meets m
LEFT JOIN times t ON t.meet_id = m.id
WHERE ($1::varchar = '' OR m.course_type = $1)
GROUP BY m.id
ORDER BY m.date DESC
LIMIT $2;
