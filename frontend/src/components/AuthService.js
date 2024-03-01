import { gql } from "@apollo/client";
import client from "../apollo-client";

export const register = async (username, password) => {
  const REGISTER_MUTATION = gql`
    mutation Register($username: String!, $password: String!) {
      register(loginUserInput: { username: $username, password: $password }) {
        user {
          user_id
          username
        }
        access_token
      }
    }
  `;

  try {
    const { data } = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: { username, password },
    });

    localStorage.setItem("user_id", data.register.user.user_id.toString());
    localStorage.setItem("username", data.register.user.username);
    localStorage.setItem("access_token", data.register.access_token);
    return data.register;
  } catch (error) {
    console.error("Registration error", error);
    throw new Error("Registration failed.");
  }
};

export const login = async (username, password) => {
  const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
      login(loginUserInput: { username: $username, password: $password }) {
        user {
          user_id
          username
        }
        access_token
      }
    }
  `;

  try {
    const { data } = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: { username, password },
    });

    localStorage.setItem("user_id", data.login.user.user_id.toString());
    localStorage.setItem("username", data.login.user.username);
    localStorage.setItem("access_token", data.login.access_token);
    return data.login;
  } catch (error) {
    console.error("Login error", error);
    throw new Error("Login failed.");
  }
};

export const logout = async () => {
  localStorage.removeItem("username");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_id");
};
