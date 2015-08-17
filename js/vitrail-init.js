// vitrail-init.js
// Copyright 2015 Christopher Antila


// This is written in straight-up ECMAScript 5, bro.
define(["react", "vitrail"], function(React, Vitrail) {
    React.render(
        React.createElement(Vitrail.SearchForm,
                            {rootUrl: "http://localhost:8888/"}),
        document.getElementById('vitrail-content')
    );
});
