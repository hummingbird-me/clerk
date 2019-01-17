module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
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
