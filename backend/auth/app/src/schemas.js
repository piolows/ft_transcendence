export const getUserSchema = {
	schema: {
		params: {
			type: 'object',
			properties: {
				username: { type: 'string' }
			},
			required: [ 'username' ]
		}
	}
}

export const deleteSchema = {
	body: {
		properties: {
			username: { type: 'string' },
			password: { type: 'string' }
		},
		required: [ 'username', 'password' ]
	}
}

export const loginSchema = {
	body: {
		properties: {
			username: { type: 'string' },
			password: { type: 'password' }
		},
		required: [ 'username', 'password' ]
	}
}

export const registerSchema = {
	body: {
		properties: {
			username: { type: 'string' },
			email: { type: 'email' },
			password: { type: 'password' },
			avatarURL: { type: 'string' }
		},
		required: [ 'username', 'email', 'password' ]
	}
}

export const googleLoginSchema = {
	body: {
		properties: {
			token: { type: 'string' }
		},
		required: [ 'token' ]
	}
}