var esOpts = [
  '-D es.http.port=9400',
  '-D es.network.host=localhost',
  '-D es.cluster.name=elasticsearch_js_test_runners',
  '-D es.node.name=elasticsearch_js_test_runner',
  '-D es.discovery.zen.ping.multicast.enabled=false',
  '-D es.discovery.zen.ping_timeout=1',
  '-D es.logger.level=ERROR',
];

var utils = require('../utils');

var config = {
  generate: {
    exec: 'node ./scripts/generate/index.js',
    options: {
      passArgs: [
        'verbose'
      ]
    }
  },
  browser_test_server: {
    exec: 'node ./test/utils/server',
    options: {
      wait: false,
      quiet: true,
      ready: /listening/
    }
  },
  clone_bower_repo: {
    exec: [
      'test -d src/bower_es_js',
      'git clone git@github.com:elasticsearch/bower-elasticsearch-js.git <%= bowerSubmodule %>'
    ].join(' || '),
    options: {
      quiet: true
    }
  },
  checkout_bower_repo_master: {
    exec: 'git checkout master',
    options: {
      cwd: '<%= bowerSubmodule %>',
      quiet: true
    }
  },
  checkout_bower_repo_prerelease: {
    exec: 'git checkout prerelease',
    options: {
      cwd: '<%= bowerSubmodule %>',
      quiet: true
    }
  },
  push_prerelease_branch: {
    exec: 'git add -A && git commit -m "prerelease build" && git push origin prerelease',
    options: {
      cwd: '<%= bowerSubmodule %>',
      quite: true
    }
  },
  release_bower_tag: {
    exec: 'node ./scripts/release/bower'
  }
};

utils.branches.forEach(function (branch) {

  config['generate_' + branch] = {
    exec: 'node ./scripts/generate/index.js --branch=' + branch
  };

  config['install_es_' + branch] = {
    exec: './scripts/es.sh install ' + branch,
  };

  var args = esOpts.slice(0);

  switch (branch) {
  case '0.90':
    args.push('-f');
    break;
  case '1.0':
  case '1.1':
    // no special treatment
    break;
  default:
    args.push('-Des.node.bench=true', '-Des.script.disable_dynamic=false');
    break;
  }

  config['es_' + branch] = {
    exec: './.snapshots/' + branch + '_nightly/bin/elasticsearch ' + args.join(' '),
    options: {
      wait: false,
      quiet: true
    }
  };
});

module.exports = config;