#!/usr/bin/env bash

set -ex

build()
{
    ROOT=`pwd`
    RPM_BUILD=${ROOT}/rpmbuild
    RELEASE=${ROOT}/release
    ARCH=`uname -i`

    rm -rf ${RELEASE}
    rm -rf ${RPM_BUILD}

    echo "%_topdir ${RPM_BUILD}" > ~/.rpmmacros
    mkdir -p ${RPM_BUILD}/BUILD ${RPM_BUILD}/RPMS/${ARCH} ${RPM_BUILD}/SRPMS
    rpmbuild -bb $1
    mkdir -p ${RELEASE}
    cp ${RPM_BUILD}/RPMS/${ARCH}/* ${RELEASE}
    rm -rf ~/.rpmmacros
    rm -rf ${RPM_BUILD}

    echo "Build rpm finished!"
}
if [ ! $# == 1 ]; then
    echo "Usage:"
    echo "./rpm-build.sh SPEC-FILE"
    exit 1
fi
if [ ! -n "$1" ]; then
    echo "Usage:"
    echo "./rpm-build.sh SPEC-FILE"
    exit 1
else
    build $1
fi