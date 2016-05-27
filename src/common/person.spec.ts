/// <reference path="../../typings/index.d.ts" />

import * as test from "tape";
import {Person} from "./person";

test("Person", function (t: test.Test): void {

    t.test("can be constructed", function (t: test.Test): void {
        const person: Person = new Person("Fred", "Flintstone");
        t.ok(person);
        t.end();
    });

});
