// Authentication Module using AWS Cognito

class Auth {
    constructor() {
        this.currentUser = null;
    }

    // Sign up a new user
    async signUp(email, password) {
        const url = `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com/`;
        
        const params = {
            ClientId: AWS_CONFIG.userPoolWebClientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Sign up failed');
        }

        return data;
    }

    // Confirm sign up with verification code
    async confirmSignUp(email, code) {
        const url = `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com/`;
        
        const params = {
            ClientId: AWS_CONFIG.userPoolWebClientId,
            Username: email,
            ConfirmationCode: code
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
        }

        return data;
    }

    // Sign in user
    async signIn(email, password) {
        const url = `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com/`;
        
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: AWS_CONFIG.userPoolWebClientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.AuthenticationResult) {
            // Store tokens
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
            localStorage.setItem('userEmail', email);
            
            this.currentUser = { email };
            return data.AuthenticationResult;
        }

        throw new Error('Authentication failed');
    }

    // Sign out user
    signOut() {
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        this.currentUser = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return localStorage.getItem('idToken') !== null;
    }

    // Get current user's email
    getCurrentUserEmail() {
        return localStorage.getItem('userEmail');
    }

    // Get ID token for API calls
    getIdToken() {
        return localStorage.getItem('idToken');
    }

    // Refresh token if needed (simplified version)
    async refreshSession() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const url = `https://cognito-idp.${AWS_CONFIG.region}.amazonaws.com/`;
        
        const params = {
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: AWS_CONFIG.userPoolWebClientId,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        if (data.AuthenticationResult) {
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            return data.AuthenticationResult;
        }

        throw new Error('Token refresh failed');
    }
}

// Create global auth instance
window.auth = new Auth();
