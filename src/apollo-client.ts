import {
  ApolloLink,
  ApolloClient,
  concat,
  HttpLink,
  InMemoryCache,
  DefaultOptions,
} from "@apollo/client";
import { REFRESH_TOKEN } from "./operation/auth.mutation";
import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;
const httpLink = new HttpLink({ uri: API_URL });

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

const callRefreshToken = async (email: string, refreshToken: string) => {
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions,
  });

  const { data } = await apolloClient.mutate({
    mutation: REFRESH_TOKEN,
    variables: { input: { email, refreshToken } },
  });

  return data;
};

const authMiddleware = new ApolloLink((operation, forward) => {
  const guest = localStorage.getItem("guest");

  if (guest === "true") {
    return forward(operation);
  }

  const token = localStorage.getItem("token");
  const logIn = localStorage.getItem("logIn");
  const expiredTime = localStorage.getItem("expiredTime");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!expiredTime || expiredTime < new Date().toISOString()) {
    if (token && refreshToken) {
      const payload: any = jwtDecode(token);
      callRefreshToken(payload.email, refreshToken)
        .then((data) => {
          if (data.errors) {
            window.location.href = "/login";
          }

          localStorage.setItem("token", data.refreshToken?.token);
          const date = new Date();

          date.setHours(date.getHours() + 1);
          localStorage.setItem("expiredTime", date.toISOString());
        })
        .catch((error) => {
          localStorage.clear();
          console.log(error);
          window.location.href = "/login";
        });
    }
  }

  if (!token && logIn !== "true") {
    window.location.href = "/login";
  }

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions,
});

export default apolloClient;
