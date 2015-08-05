var TypeRadioButton = React.createClass({
    render: function() {
        return (
            <label><input type="radio" name="resourceType" value={this.props.value} onChange={this.handleChange} />{this.props.label}</label>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var TypeSelector = React.createClass({
    render: function() {
        var renderedButtons = [];
        this.props.types.forEach(function (buttonDeets) {
            renderedButtons.push(<TypeRadioButton label={buttonDeets[0]} value={buttonDeets[1]} onUserInput={this.props.onUserInput} />);
        }, this);
        return  (
            <div className="typeSelector">
                <h2>Select a Result Type</h2>
                <form>
                    {renderedButtons}
                </form>
            </div>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var PerPageSelector = React.createClass({
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
    render: function() {
        if (this.props.link) {
            return (
                <td><a href={this.props.link}>{this.props.data}</a></td>
            )
        } else {
            return (
                <td>{this.props.data}</td>
            )
        }
    }
});

var Result = React.createClass({
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
            renderedColumns.push(<ResultColumn key="drupal_path" data="CD" link={this.props.data["drupal_path"]} />);
        }
        return (
            <tr>
                {renderedColumns}
            </tr>
        );
    }
});

var ResultList = React.createClass({
    render: function() {
        var tableHeader = [];
        var results = [];

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if ('initial' != this.props.jqxhr) {
            var columns = this.props.jqxhr.getResponseHeader('X-Cantus-Fields').split(',');

            // remove the field names in "dontRender"
            for (field in this.props.dontRender) {
                var pos = columns.indexOf(this.props.dontRender[field]);
                if (pos >= 0) {
                    columns.splice(pos, 1);
                }
            };

            columns.forEach(function(col) {
                tableHeader.push(<ResultColumn key={col} data={col} />);
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
                <h2>These are some results.</h2>
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
    changePage: function(button) {
        this.props.changePage(button.target.value);
    },
    render: function() {
        return (
            <div className="paginator">
                <button type="button" name="pages" value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" name="pages" value="previous" onClick={this.changePage}>&lt;</button>
                &nbsp;{this.props.currentPage} of {this.props.totalPages}&nbsp;
                <button type="button" name="pages" value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" name="pages" value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});

var ResultListFrame = React.createClass({
    getNewData: function(resourceType, requestPage, perPage) {
        if (undefined === requestPage) {
            requestPage = 1;
        }
        if (undefined === perPage) {
            perPage = 10;
        }
        var requestUrl = "http://localhost:8888/" + resourceType + "/";
        $.ajax({
            url: requestUrl,
            headers: {"X-Cantus-Page": requestPage, "X-Cantus-Per-Page": perPage},
            dataType: 'json',
            cache: false,
            success: function(data, status, jqxhr) {
                this.setState({data: data, jqxhr: jqxhr, page: requestPage});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(requestUrl, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() { this.getNewData(this.props.resourceType); },
    componentWillReceiveProps: function(newProps) {
        // check "perPage" is valid
        if (newProps.perPage < 1 || newProps.perPage > 100) {
            return;
        }
        // otherwise we can go ahead and update
        else {
            this.getNewData(newProps.resourceType, 1, newProps.perPage);
        }
    },
    getInitialState: function() {
        return {data: {}, jqxhr: "initial", page: 1};
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page.
        var totalPages = 1;
        if ("initial" != this.state.jqxhr) {
            totalPages = Math.ceil(this.state.jqxhr.getResponseHeader("X-Cantus-Total-Results") /
                                   this.state.jqxhr.getResponseHeader("X-Cantus-Per-Page"));
        }
        if ("next" === direction) {
            if (this.state.page <= totalPages) {
                this.getNewData(this.props.resourceType, this.state.page + 1, this.props.perPage);
            }
        } else if ("previous" === direction) {
            if (this.state.page > 1) {
                this.getNewData(this.props.resourceType, this.state.page - 1, this.props.perPage);
            }
        } else if ("first" === direction) {
            this.getNewData(this.props.resourceType, 1, this.props.perPage);
        } else if ("last" === direction) {
            this.getNewData(this.props.resourceType, totalPages, this.props.perPage);
        } else {
            console.err("Did not understand direction to turn the page: " + direction);
        }
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
                <Paginator changePage={this.changePage} currentPage={currentPage} totalPages={totalPages} />
            </div>
        );
    }
});

var SearchForm = React.createClass({
    getInitialState: function() {
        return {resourceType: "cantusids", perPage: 10};
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage}); },
    changeResourceType: function(resourceType) { this.setState({resourceType: resourceType}); },
    render: function() {
        // the resource types to allow searching for
        var types = [
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
            ['Source Status', 'statii']
        ];
        // fields that shouldn't be rendered for users
        var dontRender = ['type', 'id'];
        return (
            <div className="searchForm">
                <TypeSelector onUserInput={this.handleUserInput} types={types} />
                <PerPageSelector onUserInput={this.changePerPage} perPage={this.state.perPage} />
                <ResultListFrame resourceType={this.state.resourceType}
                                 dontRender={dontRender}
                                 perPage={this.state.perPage}
                />
            </div>
        );
    }
});

React.render(
    <SearchForm />,
    document.getElementById('content')
    );
