#!/bin/bash

# Test Authentication API
# Usage: ./test-auth.sh

echo "🔐 Testing Mien Termin Authentication API"
echo "=========================================="
echo ""

API_URL="http://localhost:8000/api"

# Test 1: Login with Demo Account
echo "📝 Test 1: Login with Demo Account"
echo "Email: demo@test.de"
echo "Password: Demo@123"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "demo@test.de",
    "password": "Demo@123"
  }')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login Failed - No token received"
  echo ""
  exit 1
else
  echo "✅ Login Successful"
  echo "Token: ${TOKEN:0:20}..."
  echo ""
fi

# Test 2: Get Current User
echo "📝 Test 2: Get Current User Info"
USER_RESPONSE=$(curl -s -X GET "${API_URL}/auth/user" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$USER_RESPONSE" | jq '.'
echo ""

# Test 3: Get Doctors List
echo "📝 Test 3: Get Doctors List (Protected Route)"
DOCTORS_RESPONSE=$(curl -s -X GET "${API_URL}/doctors" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$DOCTORS_RESPONSE" | jq '.'
echo ""

# Test 4: Get Patients List
echo "📝 Test 4: Get Patients List (Protected Route)"
PATIENTS_RESPONSE=$(curl -s -X GET "${API_URL}/patients" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PATIENTS_RESPONSE" | jq '.'
echo ""

# Test 5: Get Appointments List
echo "📝 Test 5: Get Appointments List (Protected Route)"
APPOINTMENTS_RESPONSE=$(curl -s -X GET "${API_URL}/appointments" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$APPOINTMENTS_RESPONSE" | jq '.'
echo ""

echo "=========================================="
echo "✅ All tests completed!"
echo ""
echo "Test Summary:"
echo "1. Login: ✅"
echo "2. Get User: $([ -n \"$(echo $USER_RESPONSE | jq -r '.user // empty')\" ] && echo '✅' || echo '❌')"
echo "3. Get Doctors: $([ -n \"$(echo $DOCTORS_RESPONSE | jq -r '.data // empty')\" ] && echo '✅' || echo '❌')"
echo "4. Get Patients: $([ -n \"$(echo $PATIENTS_RESPONSE | jq -r '.data // empty')\" ] && echo '✅' || echo '❌')"
echo "5. Get Appointments: $([ -n \"$(echo $APPOINTMENTS_RESPONSE | jq -r '.data // empty')\" ] && echo '✅' || echo '❌')"
