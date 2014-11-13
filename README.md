This repository tracks step-by-step code samples for the guides on http://developer.onsip.com

### Admin Note

The steps of the guide map directly to single commits on a given branch.  Git tags are used to link directly from developer.onsip.com to the commit on GitHub.

**To update the tutorials**, the updates must be *rebased* onto their proper step.  To do this:

1. Create a new branch with the current date (and optional post-fix, if multiple updates per day)
2. `git rebase -i 19ea229` (Rebase from the initial commit)
3. Select each step that requires changes using the `edit` option.
4. As you rebase, commit changes to the current step using `git commit --amend`
5. Push your new branch. (Did you already push it before the rebase?  You *may* need to **CAREFULLY** force push.)
6. When the new code is ready to "release," update the tags for each step, one by one.  (Ex: `git tag -f a-1 mygithash`)
7. You remembered to check the tutorials to make sure the descriptions and examples match the new code, right?

