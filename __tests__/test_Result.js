// tests/test_Result.js

jest.dontMock("../js/vitrail");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var Vitrail = require("../js/vitrail");
var Result = Vitrail.Result;


describe("Result", function() {

    it("renders properly", function() {
        // This test tests:
        // - the "self" link attached to the "name" data member
        // - the "drupal_path" link created with "Show" data member
        // - "time" data given the "time" link in resources
        // - data member without link isn't given a link ("food")
        // - member in "data" that isn't in "columns" isn't rendered ("eaten_already")
        var columns = ["name", "time", "food"];
        var data = {"name": "早饭", "time": "早上", "food": "包子和橙子", "eaten_already": false,
                    "drupal_path": "http://whatever"};
        var resources = {"self": "https://zh.wikipedia.org/wiki/%E6%97%A9%E9%A4%90",
                         "time": "https://en.wiktionary.org/wiki/morning"};
        var testResult = React.createElement(Result,
                                             {columns: columns, data: data, resources: resources});
        // do a shallow render
        var renderer = TestUtils.createRenderer();
        renderer.render(testResult);
        var rendered = renderer.getRenderOutput();
        var nameCol = rendered.props.children[0];
        var timeCol = rendered.props.children[1];
        var foodCol = rendered.props.children[2];
        var drupalCol = rendered.props.children[3];
        // check my expectations!
        expect(rendered.type).toBe("tr");
        expect(rendered.props.children.length).toBe(4);
        //
        expect(nameCol.type.displayName).toBe("ResultColumn");
        expect(nameCol.props.data).toBe(data.name);
        expect(nameCol.props.link).toBe(resources.self);
        //
        expect(timeCol.type.displayName).toBe("ResultColumn");
        expect(timeCol.props.data).toBe(data.time);
        expect(timeCol.props.link).toBe(resources.time);
        //
        expect(foodCol.type.displayName).toBe("ResultColumn");
        expect(foodCol.props.data).toBe(data.food);
        expect(foodCol.props.link).toBe("");
        //
        expect(drupalCol.type.displayName).toBe("ResultColumn");
        expect(drupalCol.props.data).toBe("Show");
        expect(drupalCol.props.link).toBe(data.drupal_path);
    });

});
