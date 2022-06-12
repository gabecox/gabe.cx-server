import { UserCredentials } from "../entities/User";

export const validateUsername = (username: string) => {
  if (username.length <= 2) {
    return [
      {
        field: "username",
        message: "username length must be longer than 2 characters",
      },
    ];
  }
  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "username cannot contain the '@' symbol",
      },
    ];
  }
  return null;
};

export const validateEmail = (email: string) => {
  if (!email.includes("@")) {
    return [
      {
        field: "email",
        message: "please enter a valid email address",
      },
    ];
  }
  return null;
};

export const validatePassword = (password: string) => {
  if (password.length <= 3) {
    return [
      {
        field: "password",
        message: "password length must be longer than 3 characters",
      },
    ];
  }

  return null;
};

export const validateCredentials = (options: UserCredentials) => {
  let error = null;
  error = validateUsername(options.username);
  error = error ? error : validateEmail(options.email);
  error = error ? error : validatePassword(options.password);
  return error;
};
