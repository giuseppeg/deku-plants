import { dom, render, tree } from 'deku';
import App from './app';
import cards from './cards';
import bus from 'bus';

var app = tree(<App />);
var appContainer = document.querySelector('main');
render(app, appContainer);
app.use(cards());
