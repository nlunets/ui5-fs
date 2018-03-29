const {test} = require("ava");
const {promisify} = require("util");
const Buffer = require("buffer").Buffer;
const path = require("path");
const fs = require("fs");
const ui5Fs = require("../../");
const fsInterface = ui5Fs.fsInterface;
const MemAdapter = ui5Fs.Memory;
const FsAdapter = ui5Fs.FileSystem;
const Resource = ui5Fs.Resource;

const assertReadFile = (t, readFile, basepath, filepath) => {
	const fullpath = basepath + filepath;
	return readFile(fullpath).then((buffer) => {
		t.true(Buffer.isBuffer(buffer));
		t.deepEqual(buffer.toString(), "content of " + filepath);
	}).then(() => readFile(fullpath, {})).then((buffer) => {
		t.true(Buffer.isBuffer(buffer));
		t.deepEqual(buffer.toString(), "content of " + filepath);
	}).then(() => readFile(fullpath, {encoding: null})).then((buffer) => {
		t.true(Buffer.isBuffer(buffer));
		t.deepEqual(buffer.toString(), "content of " + filepath);
	}).then(() => readFile(fullpath, "utf8").then((content) => {
		t.is(typeof content, "string");
		t.deepEqual(content, "content of " + filepath);
	}).then(() => readFile(fullpath, {encoding: "utf8"})).then((content) => {
		t.is(typeof content, "string");
		t.deepEqual(content, "content of " + filepath);
	}));
};

test("MemAdapter: readFile", (t) => {
	let memAdapter = new MemAdapter({
		virBasePath: "/"
	});
	const fs = fsInterface(memAdapter);
	const readFile = promisify(fs.readFile);

	return memAdapter.write(new Resource({
		path: "/foo.txt",
		string: "content of /foo.txt"
	})).then(() => assertReadFile(t, readFile, "", "/foo.txt"));
});

test("FsAdapter: readFile", (t) => {
	let fsAdapter = new FsAdapter({
		virBasePath: "/",
		fsBasePath: path.join(__dirname, "..", "fixtures", "fsInterface")
	});
	const fs = fsInterface(fsAdapter);
	const readFile = promisify(fs.readFile);

	return assertReadFile(t, readFile, "", "/foo.txt");
});

test("fs: readFile", (t) => {
	const readFile = promisify(fs.readFile);
	return assertReadFile(t, readFile, path.join(__dirname, "..", "fixtures", "fsInterface"), "/foo.txt");
});


const assertStat = (t, stat, basepath, filepath) => {
	const fullpath = basepath + filepath;
	return stat(fullpath).then((stats) => {
		t.is(stats.isFile(), true);
		t.is(stats.isDirectory(), false);
		t.is(stats.isBlockDevice(), false);
		t.is(stats.isCharacterDevice(), false);
		t.is(stats.isSymbolicLink(), false);
		t.is(stats.isFIFO(), false);
		t.is(stats.isSocket(), false);
	});
};

test("MemAdapter: stat", (t) => {
	let memAdapter = new MemAdapter({
		virBasePath: "/"
	});
	const fs = fsInterface(memAdapter);
	const stat = promisify(fs.stat);

	return memAdapter.write(new Resource({
		path: "/foo.txt",
		string: "content of /foo.txt"
	})).then(() => assertStat(t, stat, "", "/foo.txt"));
});

test("FsAdapter: stat", (t) => {
	let fsAdapter = new FsAdapter({
		virBasePath: "/",
		fsBasePath: path.join(__dirname, "..", "fixtures", "fsInterface")
	});
	const fs = fsInterface(fsAdapter);
	const stat = promisify(fs.stat);

	return assertStat(t, stat, "", "/foo.txt");
});

test("fs: stat", (t) => {
	const stat = promisify(fs.stat);
	return assertStat(t, stat, path.join(__dirname, "..", "fixtures", "fsInterface"), "/foo.txt");
});
