'use strict';
const path = require('path');
const mockery = require('mockery');
let pathStub = { };
const proxyquire = require('proxyquire').noCallThru();
const ComponentList = require(path.resolve('GruntfileComponents.js'));
//const foo = ComponentList.getComponentsByName();
//console.log(foo);
const getFileFromPath = require(path.resolve('GruntfileComponents.js'));
//console.log(getFileFromPath.getComponentFromPath('core/templates'));

var requirejs = require("requirejs");
requirejs.config({
    baseUrl: process.cwd(),
    nodeRequire: require,
    enforceDefine: true,
    skipDataMain: true,
    waitSeconds : 0,
    paths: {
        'core/mustache': "lib/amd/src/mustache",
        'jquery': "lib/jquery/jquery-3.4.1",
        jqueryui: 'lib/jquery/ui-1.12.1/jquery-ui',
        jqueryprivate: 'lib/requirejs/jquery-private',
        'core/ajax': "lib/amd/src/ajax",
        'core/str': "lib/amd/src/str",
        'core/notification': "lib/amd/src/notification",
        'core/url': "lib/amd/src/url",
        'core/config': "lib/amd/src/config",
        'core/localstorage': "lib/amd/src/localstorage",
        'core/icon_system': "lib/amd/src/icon_system",
        'core/event': "lib/amd/src/event",
        'core/yui': "lib/amd/src/yui",
        'core/log': "lib/amd/src/log",
        'core/truncate': "lib/amd/src/truncate",
        'core/user_date': "lib/amd/src/user_date",
        'core/pending': "lib/amd/src/pending",
    },
    // Custom jquery config map.
    map: {
        // '*' means all modules will get 'jqueryprivate'
        // for their 'jquery' dependency.
        '*': { jquery: 'jqueryprivate' },
        // Stub module for 'process'. This is a workaround for a bug in MathJax (see MDL-60458).
        '*': { process: 'core/first' },

        // 'jquery-private' wants the real jQuery module
        // though. If this line was not here, there would
        // be an unresolvable cyclic dependency.
        jqueryprivate: { jquery: 'jquery' }
    },
});

//import * as bar from '../../../amd/src/local/grades/grader';

const Templates = () => {};
describe('Basic Mocha String Test', () => {
    let secondMock;
    let first;
    let export1Mock;

    /*beforeEach(() => {
        export1Mock = sinon.mock(Template);
        export1Mock
            .expects('exportFunc')
            .once()
            .returns('This is mocked exportFunc');
    });*/

    /*before(() => {
        mockery.enable();
        mockery.registerAllowable(`${process.cwd()}/${foo.mod_forum}/amd/src/local/grades/grader`);
        secondMock = {};
        mockery.registerMock('core/templates', secondMock);
        first = require(`${process.cwd()}/${foo.mod_forum}/amd/src/local/grades/grader`);
    });
    after(() => {
        mockery.disable();
    });*/
    let module2;
    let export2Mock;

    let export2 = {
        exportFunc: () => {}
    };
    /*beforeEach(() => {
        export2Mock = sinon.mock(export2);
        export2Mock
            .expects('exportFunc')
            .once()
            .returns('This is mocked exportFunc');

        module2 = proxyquire(`${process.cwd()}/${foo.mod_forum}/amd/src/local/grades/grader`, {
            'core/templates': export2,
            './local/grader/selectors': export2,
            './local/grader/user_picker': export2,
            'mod_forum/local/layout/fullscreen': export2,
            './local/grader/gradingpanel': export2,
            'core/toast': export2,
            'core/notification': export2,
            'core/str': export2,
            'core_grades/grades/grader/gradingpanel/normalise': export2,
            'core/loadingicon': export2,
            'core/utils': export2,
            'core_grades/grades/grader/gradingpanel/comparison': export2,
            'core/modal_factory': export2,
            'core/modal_events': export2,
            'core/pubsub': export2,
            'core/drawer_events': export2
        });
    });*/
    let foo;
    beforeEach((done)=> {
        // This saves the module foo for use in tests. You have to use
        // the done callback because this is asynchronous.
        /*

        `/Users/work/Projects/code/vagrant/master/lib/templates`
         */
        //console.log(process.cwd());
        requirejs(["lib/amd/src/templates.js"],
            function(mod) {
                console.log("fired!");
                foo = mod;
                done();
            });
    });

    it('ff should return number of charachters in a string', () => {
        assert.equal("Hello".length, 5);
    });

    it('ff should return first charachter of the string', () => {
        assert.equal("Hello".charAt(0), 'H');
        foo.replaceNode('', '', '');
        /*module2.view();
        export2Mock.verify();*/
    });

    /*afterEach(() => {
        export2Mock.restore();
    });*/
});


