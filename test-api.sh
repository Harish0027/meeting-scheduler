#!/bin/bash
# Scalar Schedule - API Testing Script
# Use these curl commands to test the API endpoints

BASE_URL="http://localhost:3001/api"

echo "=== Scalar Schedule API Testing ==="
echo "Base URL: $BASE_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testing API Health${NC}"
curl -X GET "$BASE_URL/health"
echo -e "\n\n"

# 2. Create Event Type
echo -e "${BLUE}2. Creating Event Type${NC}"
curl -X POST "$BASE_URL/event-types" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "30-minute consultation",
    "description": "One-on-one consultation call",
    "duration": 30,
    "slug": "consultation"
  }'
echo -e "\n\n"

# 3. Get All Event Types
echo -e "${BLUE}3. Getting All Event Types${NC}"
curl -X GET "$BASE_URL/event-types/all"
echo -e "\n\n"

# 4. Set Availability for Monday
echo -e "${BLUE}4. Setting Availability for Monday${NC}"
curl -X POST "$BASE_URL/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00"
  }'
echo -e "\n\n"

# 5. Set Availability for Tuesday
echo -e "${BLUE}5. Setting Availability for Tuesday${NC}"
curl -X POST "$BASE_URL/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "18:00"
  }'
echo -e "\n\n"

# 6. Get Availability
echo -e "${BLUE}6. Getting Availability${NC}"
curl -X GET "$BASE_URL/availability"
echo -e "\n\n"

# 7. Get Available Time Slots
echo -e "${BLUE}7. Getting Available Time Slots for Next Monday${NC}"
# Calculate next Monday's date
NEXT_MONDAY=$(date -d "next monday" +%Y-%m-%d 2>/dev/null || date -v+monday +%Y-%m-%d 2>/dev/null || echo "2024-01-22")
echo "Date: $NEXT_MONDAY"
curl -X GET "$BASE_URL/bookings/admin/consultation/slots?date=$NEXT_MONDAY"
echo -e "\n\n"

# 8. Create a Booking
echo -e "${BLUE}8. Creating a Booking${NC}"
# Calculate start time (9:00 AM on the date)
START_TIME="${NEXT_MONDAY}T09:00:00Z"
END_TIME="${NEXT_MONDAY}T09:30:00Z"
curl -X POST "$BASE_URL/bookings/admin/consultation" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventTypeSlug\": \"consultation\",
    \"bookerName\": \"John Doe\",
    \"bookerEmail\": \"john@example.com\",
    \"bookerPhone\": \"+1234567890\",
    \"startTime\": \"$START_TIME\",
    \"endTime\": \"$END_TIME\",
    \"notes\": \"Looking forward to our discussion\"
  }"
echo -e "\n\n"

# 9. Get Upcoming Bookings
echo -e "${BLUE}9. Getting Upcoming Bookings${NC}"
curl -X GET "$BASE_URL/bookings/upcoming"
echo -e "\n\n"

# 10. Get All Bookings
echo -e "${BLUE}10. Getting All Bookings${NC}"
curl -X GET "$BASE_URL/bookings"
echo -e "\n\n"

# 11. Get Public Event Type
echo -e "${BLUE}11. Getting Public Event Type${NC}"
curl -X GET "$BASE_URL/event-types/admin/consultation"
echo -e "\n\n"

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000 to access the dashboard"
echo "2. Visit http://localhost:3000/admin/consultation for public booking page"
echo "3. Create bookings through the UI"
echo "4. Verify double-booking prevention"
