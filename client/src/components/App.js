import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./Home"; // eslint-disable-next-line
import AuthenticatedComponent from "./AuthenticateComponent";
import login from "./login";
import Protected from "./Protected";
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={login} />
          <Route path="/" exact component={Home} />
          <AuthenticatedComponent>
            <Route path="/protected" component={Protected} />
          </AuthenticatedComponent>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
