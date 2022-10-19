package misc

import (
	"math"
	"strings"
	"time"
)

func NewTrue() *bool {
	b := true
	return &b
}

func CalculateAge(dob string) int {
	// Format of timestamp
	format := "2006-01-02" // Mon Jan 2

	// Parse the timestamp so that it's stored in time.Time
	cur, err := time.Parse(format, dob)
	if err != nil {
		panic(err)
	}
	// Current time
	now := time.Now()
	now = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// As both are of type time.Time, it's subtractable
	dur := now.Sub(cur)

	// Print duration (in Years)
	return int(math.Trunc(dur.Seconds() / 31560000))
}

func Capitalise(str string) string {
	if strings.Contains(str, "-") {
		strSplit := strings.Split(str, "-")
		for i, word := range strSplit {
			strSplit[i] = strings.Title(word)
		}
		str = strings.Join(strSplit, "-")
		return str
	}
	str = strings.Title(str)
	return str
}
