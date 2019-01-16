module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/test/**/*.test.ts'
	],
	testEnvironment: 'node',
	collectCoverageFrom: [
		'src/**/*.ts'
	],
	coverageReporters: ['lcov', 'text']
};
