import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Organisation} from "../../Types/organisation";
import {ConnectUserResponse, CreateUserResponse} from 'src/Types/userType';
import {getFromStorage, LocalStorageLabel, putToStorage} from "./localStorage";

export interface UserClientInterface {
	organisation?: Organisation
	loading: boolean; // Is the context loaded
	userResponse?: CreateUserResponse;
	setUserResponse?: Dispatch<SetStateAction<CreateUserResponse | undefined>>;
	userConnectResponse?: ConnectUserResponse;
	setUserConnectResponse?: Dispatch<SetStateAction<ConnectUserResponse | undefined>>;

	setOrganisation?:  Dispatch<SetStateAction<Organisation | undefined>>;
}

const userInitialState: UserClientInterface = {
	loading: true,
};

const UseUserClient = () => {
	const [loading, setLoading] = useState<boolean>(userInitialState.loading);
	const [organisation, setOrganisation] = useState<Organisation | undefined>();
	const [userResponse, setUserResponse] = useState<CreateUserResponse | undefined>();
	const [userConnectResponse, setUserConnectResponseState] = useState<CreateUserResponse | undefined>();

	const setUserConnectResponse = (v: CreateUserResponse) => {
		setUserConnectResponseState(v);
		putToStorage(LocalStorageLabel.User, v);
	}

	/**
	 * Init the application
	 */
	useEffect(() => {
		setLoading(true);
		const user = getFromStorage<CreateUserResponse>(LocalStorageLabel.User)
		if (!!user) setUserConnectResponse(user);
		setLoading(false);
	}, []);

	return {
		loading,
		organisation,
		setOrganisation,
		userResponse,
		setUserResponse,
		userConnectResponse,
		setUserConnectResponse
	} as UserClientInterface;
};

export { userInitialState, UseUserClient };
