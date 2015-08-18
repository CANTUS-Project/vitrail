import React from "react";
import "zepto";

var SearchBox = React.createClass({
    propTypes: {
        submitSearch: React.PropTypes.func.isRequired,
        defaultValue: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {defaultValue: ""};
    },
    submitSearch: function(changeEvent) {
        this.props.submitSearch(changeEvent.target[0].value);
        changeEvent.preventDefault();  // stop the default GET form submission
    },
    render: function() {
        return (
            <form onSubmit={this.submitSearch}>
                <label>Search Query:&nbsp;
                    <input type="search" name="searchQuery" defaultValue={this.props.contents} />&nbsp;
                    <input type="submit" value="Search" />
                </label>
            </form>
        );
    }
});

var TypeRadioButton = React.createClass({
    propTypes: {
        value: React.PropTypes.string.isRequired,
        onUserInput: React.PropTypes.func.isRequired,
        selected: React.PropTypes.bool,
        label: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {selected: false, label: ""};
    },
    render: function() {
        return (
            <label><input type="radio" name="resourceType" value={this.props.value}
                          onChange={this.handleChange} checked={this.props.selected} />
                   {this.props.label}</label>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var TypeSelector = React.createClass({
    propTypes: {
        types: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)),
        selectedType: React.PropTypes.string,
        onUserInput: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {types: [], selectedType: ""};
    },
    render: function() {
        var renderedButtons = [];
        this.props.types.forEach(function (buttonDeets, index) {
            var selected = false;
            if (this.props.selectedType === buttonDeets[1]) {
                selected = true;
            }
            renderedButtons.push(<TypeRadioButton label={buttonDeets[0]}
                                                  value={buttonDeets[1]}
                                                  onUserInput={this.props.onUserInput}
                                                  selected={selected}
                                                  key={index}
                                 />);
        }, this);
        return  (
            <div className="typeSelector">
                {renderedButtons}
            </div>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var PerPageSelector = React.createClass({
    propTypes: {
        onUserInput: React.PropTypes.func.isRequired,
        perPage: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {perPage: 10};
    },
    render: function() {
        return (
            <label>Results per page: <input type="number" name="perPage" value={this.props.perPage} onChange={this.handleChange} /></label>
        );
    },
    handleChange: function(changeEvent) {
        var newPerPage = changeEvent.target.value;
        this.props.onUserInput(newPerPage);
    }
});

var ResultColumn = React.createClass({
    propTypes: {
        link: React.PropTypes.string,
        data: React.PropTypes.string,
        header: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {link: "", data: "", header: false};
    },
    render: function() {
        var post;
        if (this.props.link) {
            post = <a href={this.props.link}>{this.props.data}</a>;
        } else {
            post = this.props.data;
        }
        if (this.props.header) {
            post = <th>{post}</th>;
        } else {
            post = <td>{post}</td>;
        }
        return post;
    }
});

var Result = React.createClass({
    propTypes: {
        // the column names to render, or the fields in "data" to render as columns
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        // the object to render into columns
        data: React.PropTypes.object.isRequired,
        // members here are the URL for the same-name member in "data"
        resources: React.PropTypes.object
    },
    getDefaultProps: function() {
        return {resources: {}};
    },
    render: function() {
        var renderedColumns = [];
        this.props.columns.forEach(function (columnName) {
            if ("name" === columnName)
                renderedColumns.push(<ResultColumn key={columnName} data={this.props.data[columnName]} link={this.props.resources['self']} />);
            else {
                renderedColumns.push(<ResultColumn key={columnName} data={this.props.data[columnName]} link={this.props.resources[columnName]} />);
            }
        }, this);
        if (this.props.data["drupal_path"] !== undefined) {
            renderedColumns.push(<ResultColumn key="drupal_path" data="Show" link={this.props.data["drupal_path"]} />);
        }
        return (
            <tr>
                {renderedColumns}
            </tr>
        );
    }
});

var ResultList = React.createClass({
    propTypes: {
        jqxhr: React.PropTypes.instanceOf(XMLHttpRequest),
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,

    },
    getDefaultProps: function() {
        return {dontRender: [], data: {}, jqxhr: new XMLHttpRequest()};
    },
    render: function() {
        var tableHeader = [];
        var results = [];

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        // TODO: this is the wrong way to do this
        if ('initial' != this.props.jqxhr) {
            var columns = this.props.jqxhr.getResponseHeader('X-Cantus-Fields').split(',');
            var extraFields = this.props.jqxhr.getResponseHeader('X-Cantus-Extra-Fields');
            if (null !== extraFields) {
                extraFields = extraFields.split(',');
                columns = columns.concat(extraFields);
            }

            // remove the field names in "dontRender"
            for (var field in this.props.dontRender) {
                var pos = columns.indexOf(this.props.dontRender[field]);
                if (pos >= 0) {
                    columns.splice(pos, 1);
                }
            };

            columns.forEach(function(columnName) {
                // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
                var working = columnName.split("_");
                var polishedName = "";
                for (var i in working) {
                    var rawr = working[i][0];
                    rawr = rawr.toLocaleUpperCase();
                    polishedName += rawr;
                    polishedName += working[i].slice(1) + " ";
                }
                polishedName = polishedName.slice(0, polishedName.length);

                // now we can make the <th> cell itself
                tableHeader.push(<ResultColumn key={columnName} data={polishedName} header={true} />);
            });

            Object.keys(this.props.data).forEach(function (id) {
                if ("resources" === id)
                    return;
                results.push(<Result
                    key={id}
                    columns={columns}
                    data={this.props.data[id]}
                    resources={this.props.data.resources[id]} />);
            }, this);
        }

        return (
            <div className="resultList">
                <table>
                    <thead>
                        <tr>
                            {tableHeader}
                        </tr>
                    </thead>
                    <tbody>
                        {results}
                    </tbody>
                </table>
            </div>
        );
    }
});

var Paginator = React.createClass({
    propTypes: {
        changePage: React.PropTypes.func.isRequired,
        currentPage: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        totalPages: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
    },
    getDefaultProps: function() {
        return {currentPage: 1, totalPages: 1};
    },
    changePage: function(button) {
        this.props.changePage(button.target.value);
    },
    render: function() {
        return (
            <div className="paginator">
                <button type="button" name="pages" value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" name="pages" value="previous" onClick={this.changePage}>&lt;</button>
                <div className="blankOfBlank">
                    &nbsp;{this.props.currentPage} of {this.props.totalPages}&nbsp;
                </div>
                <button type="button" name="pages" value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" name="pages" value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});

var ResultListFrame = React.createClass({
    propTypes: {
        onError: React.PropTypes.func.isRequired,
        changePage: React.PropTypes.func.isRequired,
        hateoas: React.PropTypes.object.isRequired,
        resourceType: React.PropTypes.string,
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    getDefaultProps: function() {
        return {resourceType: "any", dontRender: []};
    },
    getNewData: function(resourceType, requestPage, perPage, searchQuery) {
        // default, unchanging things
        var ajaxSettings = {
            headers: {},
            dataType: "json",
            success: this.ajaxSuccessCallback,
            error: this.props.onError
        };

        // headers
        if (undefined === requestPage) {
            ajaxSettings.headers["X-Cantus-Page"] = 1;
        } else {
            ajaxSettings.headers["X-Cantus-Page"] = requestPage;
        }

        if (undefined === perPage) {
            ajaxSettings.headers["X-Cantus-Per-Page"] = 10;
        } else {
            ajaxSettings.headers["X-Cantus-Per-Page"] = perPage;
        }

        // URL
        ajaxSettings["url"] = this.props.hateoas.browse[resourceType];

        // search query
        if (undefined !== searchQuery && "" !== searchQuery) {
            ajaxSettings.type = "SEARCH";
            ajaxSettings.data = "{\"query\": \"" + searchQuery + "\"}";
        }

        // submit the request
        Zepto.ajax(ajaxSettings);
    },
    ajaxSuccessCallback: function(data, textStatus, jqxhr) {
        // Called when an AJAX request returns successfully.

        var totalPages = Math.ceil(jqxhr.getResponseHeader("X-Cantus-Total-Results") /
                                   jqxhr.getResponseHeader("X-Cantus-Per-Page"));
        var page = jqxhr.getResponseHeader("X-Cantus-Page");

        this.setState({data: data, jqxhr: jqxhr, page: page, totalPages: totalPages});
    },
    componentDidMount: function() { this.getNewData(this.props.resourceType); },
    componentWillReceiveProps: function(newProps) {
        // check "perPage" is valid
        if (newProps.perPage < 1 || newProps.perPage > 100) {
            return;
        }
        // check if "page" is "last"
        else if ("last" === newProps.page) {
            this.props.changePage(this.state.totalPages);
        }
        // check if "page" is valid
        else if (newProps.page > this.state.totalPages) {
            this.props.changePage(this.state.totalPages);
        }
        // otherwise we can go ahead and update
        else {
            this.getNewData(newProps.resourceType,
                            newProps.page,
                            newProps.perPage,
                            newProps.searchQuery);
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // we'll get another props change in a moment
        if ("last" === nextProps.page) {
            return false;
        // this would produce an invalid result
        } else if (nextProps.page > this.state.totalPages) {
            return false;
        } else {
            return true;
        }
    },
    getInitialState: function() {
        return {data: {}, jqxhr: "initial", page: 1, totalPages: 1};
    },
    render: function() {
        var currentPage = 0;
        var totalPages = 0;
        if ("initial" != this.state.jqxhr) {
            currentPage = this.state.jqxhr.getResponseHeader("X-Cantus-Page");
            totalPages = Math.ceil(this.state.jqxhr.getResponseHeader("X-Cantus-Total-Results") /
                                   this.state.jqxhr.getResponseHeader("X-Cantus-Per-Page"));
        }
        return (
            <div className="resultListFrame">
                <ResultList data={this.state.data} jqxhr={this.state.jqxhr} dontRender={this.props.dontRender} />
                <Paginator changePage={this.props.changePage} currentPage={this.state.page} totalPages={this.state.totalPages} />
            </div>
        );
    }
});

var SearchForm = React.createClass({
    propTypes: {
        rootUrl: React.PropTypes.string.isRequired,
    },
    getInitialState: function() {
        Zepto.ajax({
            url: this.props.rootUrl,
            method: "GET",
            dataType: "json",
            success: this.receiveRootUrl,
            error: this.failedAjaxRequest,
            cache: false
        });
        return {resourceType: "all", page: 1, perPage: 10, currentSearch: "", hateoas: null,
                serverIsCompatible: null, errorMessage: null};
    },
    receiveRootUrl: function(data, textStatus, jqxhr) {
        // when the getInitialState() AJAX request to the root URL succeeds

        // 1.) make sure the server's API version is compatible
        var requiredVersion = [0, 2, 1];  // this is a minimum
        var serverIsCompatible = jqxhr.getResponseHeader("X-Cantus-Version");
        if (serverIsCompatible.startsWith("Cantus")) {
            // the header value is like "Cantus/n.n.n"
            serverIsCompatible = serverIsCompatible.slice(7);
            var actualVersion = serverIsCompatible.split('.');
            actualVersion.map(function(num) { return parseInt(num, 10); });
            if (actualVersion[0] < requiredVersion[0] ||
                actualVersion[1] < requiredVersion[1] ||
                actualVersion[2] < requiredVersion[2]) {
                    serverIsCompatible = false;
            }
        } else {
            serverIsCompatible = false;
        }

        // 2.) save the "resources" links
        data = data.resources;

        // 3.) set everything
        this.setState({hateoas: data, serverIsCompatible: serverIsCompatible});
    },
    failedAjaxRequest: function(jqxhr, textStatus, errorThrown) {
        // when an AJAX request fails

        // 1.) if the failure happened during the initial request to the root URL
        if (null === this.state.serverIsCompatible) {
            this.setState({errorMessage: "Unable to reach the CANTUS server."});
        }

        // 2.) was there a 404, meaning no search results were found?
        else if (404 === jqxhr.status) {
            this.setState({errorMessage: "No results were found."});
        }

        // 3.) otherwise there was another failure
        else {
            var errorMessage = "There was an error while contacting the CANTUS server:\n" + jqxhr.status + " " + jqxhr.statusText;
            console.error(errorMessage);
            this.setState({errorMessage: errorMessage});
        }
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        var newPage = 1;
        var curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null});
    },
    submitSearch: function(searchQuery) {
        this.setState({currentSearch: searchQuery, page: 1, errorMessage: null});
    },
    render: function() {
        var mainScreen = null;

        // the resource types to allow searching for
        var types = [
            ['Any Type', 'all'],
            ['Cantus ID', 'cantusids'],
            ['Centuries', 'centuries'],
            ['Chants', 'chants'],
            ['Feasts', 'feasts'],
            ['Genres', 'genres'],
            ['Indexers', 'indexers'],
            ['Notations', 'notations'],
            ['Offices', 'offices'],
            ['Provenances', 'provenances'],
            ['RISM Sigla', 'sigla'],
            ['Segments', 'segments'],
            ['Sources', 'sources'],
            ['Source Status', 'source_statii']
        ];
        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        var dontRender = ['type', 'id'];
        if ('browse' === this.state.resourceType) {
            // if there may be many types, we want users to know what they're getting
            dontRender = ['id'];
        }

        // if we don't have "serverIsCompatible," it means we can't do anything yet
        if (null === this.state.serverIsCompatible && null === this.state.errorMessage) {
            return (
                <p>(waiting on the server)</p>
            );
        } else if (null === this.state.serverIsCompatible && null !== this.state.errorMessage) {
            return (
                <p>{this.state.errorMessage}</p>
            );
        } else if (false === this.state.serverIsCompatible) {
            return (
                <p>The Cantus server is incompatible with this version of Vitrail.</p>
            );
        }

        // the server is compatible, but there was another error
        else if (null !== this.state.errorMessage) {
            mainScreen = (<p>{this.state.errorMessage}</p>);
        }

        // otherwise we'll show the usual thing
        else {
            mainScreen = (<ResultListFrame resourceType={this.state.resourceType}
                                           dontRender={dontRender}
                                           perPage={this.state.perPage}
                                           page={this.state.page}
                                           searchQuery={this.state.currentSearch}
                                           changePage={this.changePage}
                                           hateoas={this.state.hateoas}
                                           onError={this.failedAjaxRequest}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm">
                <div className="searchSettings">
                    <h2>Query Settings</h2>
                    <SearchBox contents={this.state.currentSearch} submitSearch={this.submitSearch} />
                    <TypeSelector onUserInput={this.changeResourceType}
                                  types={types}
                                  selectedType={this.state.resourceType} />
                    <PerPageSelector onUserInput={this.changePerPage} perPage={this.state.perPage} />
                </div>
                <div className="searchResults">
                    <h2>Results</h2>
                    {mainScreen}
                </div>
            </div>
        );
    }
});

export {SearchBox, TypeRadioButton, TypeSelector, PerPageSelector, ResultColumn, Result, ResultList,
        Paginator, ResultListFrame, SearchForm};
