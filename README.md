# To-Do

## Features to Implement
- [ ] Improve navbar.
- [x] Add functionality to compare forecasts for two cities:
  - [x] Show which city is colder/hotter.
  - [x] Display humidity percentage.
  - [x] Show time zone difference.
  - [x] Include "last updated" timestamp.

## Bug Fixes
- [ ] **/forecast Page**: Fix issue where searching again without changing the number of days or date does not update the page.

## Updates
- [ ] Ensure the `maxDate` field is nullable:
  - [ ] If `maxDate` is null:
    - [ ] Set `maxDate = minDate`.
    - [ ] Set `minDate = today`.
