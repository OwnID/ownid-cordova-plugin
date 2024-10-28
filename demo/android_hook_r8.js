#!/usr/bin/env node

// Script modifies root buld.gradle file by adding additional "com.android.tools:r8:8.1.56"
// dependency to fix bug: https://r8-review.googlesource.com/c/r8/+/79240

const dependencyToAdd = 'classpath "com.android.tools:r8:8.1.56"';

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const gradleFilePath = path.join(context.opts.projectRoot, 'platforms', 'android', 'build.gradle');

    if (fs.existsSync(gradleFilePath)) {
        let gradleContent = fs.readFileSync(gradleFilePath, 'utf8');

        if (gradleContent.includes(dependencyToAdd)) {
            console.log('R8 Hook: Dependency already exists in build.gradle');
            return;
        }

        const buildscriptDependenciesRegex = /buildscript\s*\{([\s\S]*?)\n\}/m;
        const match = gradleContent.match(buildscriptDependenciesRegex);

        if (match) {
            const buildscriptContent = match[1];

            // Find the dependencies block within the buildscript
            const dependenciesRegex = /dependencies\s*\{([\s\S]*?)\n\s*\}/m;
            const dependenciesMatch = buildscriptContent.match(dependenciesRegex);

            if (dependenciesMatch) {
                const existingDependencies = dependenciesMatch[1];

                // Append the new dependency
                const updatedDependencies = `${existingDependencies}\n        ${dependencyToAdd}`;

                // Replace the old dependencies block with the updated one
                const updatedBuildscriptContent = buildscriptContent.replace(
                    dependenciesRegex, `dependencies {\n${updatedDependencies}\n    }`
                );

                // Replace the old buildscript block with the updated one
                gradleContent = gradleContent.replace(
                    buildscriptDependenciesRegex, `buildscript {${updatedBuildscriptContent}\n}`
                );

                // Write the updated content back to build.gradle
                fs.writeFileSync(gradleFilePath, gradleContent, 'utf8');
                console.log('R8 Hook: Added classpath dependency to build.gradle.');
            } else {
                console.warn('R8 Hook: Dependencies block not found within buildscript.');
            }
        } else {
            console.warn('R8 Hook: Buildscript block not found in build.gradle.');
        }
    } else {
        console.warn('R8 Hook: build.gradle file not found.');
    }
};
