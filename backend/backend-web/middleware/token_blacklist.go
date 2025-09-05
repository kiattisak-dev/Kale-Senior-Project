package middleware

var TokenBlacklist = make(map[string]bool)

func IsTokenBlacklisted(token string) bool {
	return TokenBlacklist[token]
}

func BlacklistToken(token string) {
	TokenBlacklist[token] = true
}