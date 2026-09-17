const fs = require('fs');
const path = require('path');

function patchRuntimeScheduler() {
  const file = path.join(__dirname, '../node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h');
  if (!fs.existsSync(file)) {
    console.log(`[patch] Skip RuntimeScheduler.h (not found at ${file})`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/SWIFT_RETURNS_RETAINED /g, '');
  content = content.replace(
    'SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler);',
    'SWIFT_IMMORTAL_REFERENCE;'
  );
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('[patch] Successfully patched RuntimeScheduler.h');
  } else {
    console.log('[patch] RuntimeScheduler.h already patched or pattern not found');
  }
}

function patchPackageSwift() {
  const file = path.join(__dirname, '../node_modules/expo-modules-jsi/apple/Package.swift');
  if (!fs.existsSync(file)) {
    console.log(`[patch] Skip Package.swift (not found at ${file})`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/^[ \t]*\.enableUpcomingFeature\("NonisolatedNonsendingByDefault"\),/gm, '        // .enableUpcomingFeature("NonisolatedNonsendingByDefault"),');
  content = content.replace(/^[ \t]*\.enableUpcomingFeature\("InferIsolatedConformances"\),/gm, '        // .enableUpcomingFeature("InferIsolatedConformances"),');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('[patch] Successfully patched Package.swift');
  } else {
    console.log('[patch] Package.swift already patched or pattern not found');
  }
}

function patchJavaScriptRuntime() {
  const file = path.join(__dirname, '../node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift');
  if (!fs.existsSync(file)) {
    console.log(`[patch] Skip JavaScriptRuntime.swift (not found at ${file})`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Add SendableBox at top if not present
  if (!content.includes('private struct SendableBox<T>: @unchecked Sendable')) {
    const importMarker = 'internal import jsi\n';
    const sendableBoxDef = `internal import jsi

private struct SendableBox<T>: @unchecked Sendable {
  let value: T
  init(_ value: T) { self.value = value }
}
`;
    content = content.replace(importMarker, sendableBoxDef);
  }

  // Normalize line endings to LF for matching
  const hasCRLF = content.includes('\r\n');
  if (hasCRLF) {
    content = content.replace(/\r\n/g, '\n');
  }

  // Patch getter
  const oldGetter = `      let propertyName = String(cString: propertyName)
      nonisolated(unsafe) let resultPtr = resultPtr

      return withGuaranteedContext(context) { (context: HostObjectContext, runtime) in
        return JavaScriptActor.assumeIsolated {
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultPtr)
          }
        }
      }`;

  const newGetter = `      let propertyName = String(cString: propertyName)
      let resultBox = SendableBox(resultPtr)

      return withGuaranteedContext(context) { (context: HostObjectContext, runtime) in
        return JavaScriptActor.assumeIsolated {
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultBox.value)
          }
        }
      }`;

  content = content.replace(oldGetter, newGetter);

  // Patch first call
  const oldCall1 = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }
    }`;

  const newCall1 = `    let thisBox = SendableBox(thisPtr)
    let argsBox = SendableBox(argumentsPtr)
    let resultBox = SendableBox(resultPtr)

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisBox.value).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argsBox.value, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultBox.value)
        }
      }
    }`;

  content = content.replace(oldCall1, newCall1);

  // Patch second call
  const oldCall2 = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }
    }`;

  const newCall2 = `    let thisBox = SendableBox(thisPtr)
    let argsBox = SendableBox(argumentsPtr)
    let resultBox = SendableBox(resultPtr)

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    return withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argsBox.value, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisBox.value)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultBox.value)
        }
      }
    }`;

  content = content.replace(oldCall2, newCall2);

  if (hasCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('[patch] Successfully patched JavaScriptRuntime.swift');
  } else {
    console.log('[patch] JavaScriptRuntime.swift already patched or pattern not found');
  }
}

console.log('Running ExpoModulesJSI patches...');
patchRuntimeScheduler();
patchPackageSwift();
patchJavaScriptRuntime();
console.log('Patching completed.');
