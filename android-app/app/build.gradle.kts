plugins {
  alias(libs.plugins.android.application)
}

android {
  namespace = "com.decotime.colorchart"
  compileSdk = 34

  defaultConfig {
    applicationId = "com.decotime.colorchart"
    minSdk = 21
    targetSdk = 34
    versionCode = 1
    versionName = "1.0"
  }

  signingConfigs {
    create("release") {
      storeFile = file("../release.jks")
      storePassword = "decotime2026"
      keyAlias = "decotime"
      keyPassword = "decotime2026"
      enableV1Signing = true
      enableV2Signing = true
      enableV3Signing = true
      enableV4Signing = false
    }
  }

  buildTypes {
    release {
      isMinifyEnabled = false
      signingConfig = signingConfigs.getByName("release")
    }
    debug {
      signingConfig = signingConfigs.getByName("release")
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  buildFeatures {
    compose = false
    aidl = false
    buildConfig = false
    shaders = false
  }

  packaging {
    resources {
      excludes += "META-INF/**"
    }
  }
}

kotlin {
  jvmToolchain(17)
}

dependencies {
  // Pure lightweight Android SDK without extra heavy androidx / jetpack dependencies
}
