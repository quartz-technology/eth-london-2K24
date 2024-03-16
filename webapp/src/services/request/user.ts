import { CreateUserResponse } from 'src/Types/userType';
import { backendApi } from '../apiService';

const extendedApi = backendApi.injectEndpoints({
	endpoints: (builder) => ({
		createUser: builder.mutation<CreateUserResponse, { name: string }>({
			query: (body) => ({
				url: '/user/register',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['User'],
		}),
	}),
});

// eslint-disable-next-line import/prefer-default-export
export const { useCreateUserMutation } = extendedApi;
