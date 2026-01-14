function checkIsActive(pathname: string, itemHref: string) {
  return (
    pathname === itemHref ||
    (pathname.startsWith(itemHref + "/") &&
      (itemHref !== "/employee" ||
        (!pathname.startsWith("/employee/certificates") &&
          !pathname.startsWith("/employee/admin"))))
  );
}

console.log("--- Verifying Sidebar Logic ---");

const testCases = [
  { pathname: "/employee", itemHref: "/employee", expected: true },
  { pathname: "/employee/course/123", itemHref: "/employee", expected: true },
  { pathname: "/employee/certificates", itemHref: "/employee", expected: false },
  { pathname: "/employee/admin", itemHref: "/employee", expected: false },
  { pathname: "/employee/certificates", itemHref: "/employee/certificates", expected: true },
  { pathname: "/employee/admin", itemHref: "/employee/admin", expected: true }, // Assuming admin link href is /employee/admin
];

let allPass = true;

testCases.forEach((test, index) => {
  const result = checkIsActive(test.pathname, test.itemHref);
  const status = result === test.expected ? "PASS" : "FAIL";
  console.log(`Test ${index + 1}: Path="${test.pathname}", Item="${test.itemHref}" -> ${result} (${status})`);
  if (!result === test.expected) allPass = false;
});

if (allPass) {
  console.log("All tests passed!");
} else {
  console.error("Some tests failed!");
  process.exit(1);
}
