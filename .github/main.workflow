workflow "Run automated tests on push" {
  on = "push"
  resolves = ["NuckChorris/cc-test-reporter-action@master"]
}

action "Install" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  args = "install"
}

action "Test" {
  uses = "actions/npm@e7aaefed7c9f2e83d493ff810f17fa5ccd7ed437"
  needs = ["Install"]
  args = "test"
}

action "NuckChorris/cc-test-reporter-action@master" {
  uses = "NuckChorris/cc-test-reporter-action@master"
  needs = ["Test"]
  args = "after-build -t lcov -p ./coverage/"
}
