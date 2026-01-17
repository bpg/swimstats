// Package meet provides meet domain logic.
package meet

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/bpg/swimstats/backend/internal/store/db"
	"github.com/bpg/swimstats/backend/internal/store/postgres"
)

// Service provides meet business logic.
type Service struct {
	repo *postgres.MeetRepository
}

// NewService creates a new meet service.
func NewService(repo *postgres.MeetRepository) *Service {
	return &Service{repo: repo}
}

// Meet represents a meet with computed fields.
type Meet struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	City       string    `json:"city"`
	Country    string    `json:"country"`
	Date       string    `json:"date"`
	CourseType string    `json:"course_type"`
	TimeCount  int       `json:"time_count,omitempty"`
}

// MeetList represents a paginated list of meets.
type MeetList struct {
	Meets []Meet `json:"meets"`
	Total int    `json:"total"`
}

// Input represents input for creating/updating a meet.
type Input struct {
	Name       string `json:"name"`
	City       string `json:"city"`
	Country    string `json:"country,omitempty"`
	Date       string `json:"date"`
	CourseType string `json:"course_type"`
}

// Validate validates the meet input.
func (i Input) Validate() error {
	if i.Name == "" {
		return errors.New("name is required")
	}
	if len(i.Name) > 255 {
		return errors.New("name must be at most 255 characters")
	}
	if i.City == "" {
		return errors.New("city is required")
	}
	if len(i.City) > 255 {
		return errors.New("city must be at most 255 characters")
	}
	if i.Date == "" {
		return errors.New("date is required")
	}
	if _, err := time.Parse("2006-01-02", i.Date); err != nil {
		return errors.New("date must be a valid date in YYYY-MM-DD format")
	}
	if i.CourseType != "25m" && i.CourseType != "50m" {
		return errors.New("course_type must be '25m' or '50m'")
	}
	return nil
}

// ListParams contains parameters for listing meets.
type ListParams struct {
	CourseType *string
	Limit      int
	Offset     int
}

// Get retrieves a meet by ID.
func (s *Service) Get(ctx context.Context, id uuid.UUID) (*Meet, error) {
	row, err := s.repo.GetWithTimeCount(ctx, id)
	if err != nil {
		return nil, err
	}
	return toMeetFromRow(row), nil
}

// List retrieves a paginated list of meets.
func (s *Service) List(ctx context.Context, params ListParams) (*MeetList, error) {
	limit := int32(params.Limit)
	if limit <= 0 {
		limit = 50
	}

	rows, err := s.repo.List(ctx, postgres.ListMeetsParams{
		CourseType: params.CourseType,
		Limit:      limit,
		Offset:     int32(params.Offset),
	})
	if err != nil {
		return nil, fmt.Errorf("list meets: %w", err)
	}

	count, err := s.repo.Count(ctx, params.CourseType)
	if err != nil {
		return nil, fmt.Errorf("count meets: %w", err)
	}

	meets := make([]Meet, len(rows))
	for i, row := range rows {
		meets[i] = Meet{
			ID:         row.ID,
			Name:       row.Name,
			City:       row.City,
			Country:    row.Country,
			Date:       row.Date.Time.Format("2006-01-02"),
			CourseType: row.CourseType,
			TimeCount:  int(row.TimeCount),
		}
	}

	return &MeetList{
		Meets: meets,
		Total: int(count),
	}, nil
}

// Create creates a new meet.
func (s *Service) Create(ctx context.Context, input Input) (*Meet, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	country := input.Country
	if country == "" {
		country = "Canada"
	}

	date, _ := time.Parse("2006-01-02", input.Date)

	params := db.CreateMeetParams{
		Name:       input.Name,
		City:       input.City,
		Country:    country,
		Date:       pgtype.Date{Time: date, Valid: true},
		CourseType: input.CourseType,
	}

	dbMeet, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create meet: %w", err)
	}
	return toMeet(dbMeet), nil
}

// Update updates an existing meet.
func (s *Service) Update(ctx context.Context, id uuid.UUID, input Input) (*Meet, error) {
	if err := input.Validate(); err != nil {
		return nil, fmt.Errorf("validation: %w", err)
	}

	country := input.Country
	if country == "" {
		country = "Canada"
	}

	date, _ := time.Parse("2006-01-02", input.Date)

	params := db.UpdateMeetParams{
		ID:         id,
		Name:       input.Name,
		City:       input.City,
		Country:    country,
		Date:       pgtype.Date{Time: date, Valid: true},
		CourseType: input.CourseType,
	}

	dbMeet, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update meet: %w", err)
	}
	return toMeet(dbMeet), nil
}

// Delete deletes a meet.
func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	// First check if meet exists
	_, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete meet: %w", err)
	}
	return nil
}

// GetRecent retrieves the most recent meets.
func (s *Service) GetRecent(ctx context.Context, courseType *string, limit int) ([]Meet, error) {
	rows, err := s.repo.GetRecent(ctx, courseType, int32(limit))
	if err != nil {
		return nil, fmt.Errorf("get recent meets: %w", err)
	}

	meets := make([]Meet, len(rows))
	for i, row := range rows {
		meets[i] = Meet{
			ID:         row.ID,
			Name:       row.Name,
			City:       row.City,
			Country:    row.Country,
			Date:       row.Date.Time.Format("2006-01-02"),
			CourseType: row.CourseType,
			TimeCount:  int(row.TimeCount),
		}
	}
	return meets, nil
}

func toMeet(dbMeet *db.Meet) *Meet {
	return &Meet{
		ID:         dbMeet.ID,
		Name:       dbMeet.Name,
		City:       dbMeet.City,
		Country:    dbMeet.Country,
		Date:       dbMeet.Date.Time.Format("2006-01-02"),
		CourseType: dbMeet.CourseType,
	}
}

func toMeetFromRow(row *db.GetMeetWithTimeCountRow) *Meet {
	return &Meet{
		ID:         row.ID,
		Name:       row.Name,
		City:       row.City,
		Country:    row.Country,
		Date:       row.Date.Time.Format("2006-01-02"),
		CourseType: row.CourseType,
		TimeCount:  int(row.TimeCount),
	}
}
