Name: m-data-monitor_plat
Version: 1.0.0
Release: 1
Summary: Meitu data monitor_plat
License: Commercial
Group: Meitu
Packager: lyg@meitu.com
BuildRoot:%{_tmppath}/%{name}-%{version}-%{release}-root
BuildArch: x86_64
AutoReq: no

%define datapath $RPM_BUILD_ROOT/www/monitor_plat

%description
Meitu data monitor_plat

%prep

%build

%install
rm -fr $RPM_BUILD_ROOT
mkdir -p %{datapath}

TRUNK_ROOT_DIR="$OLDPWD"
cp -r $TRUNK_ROOT_DIR/bin                     %{datapath}/
cp -r $TRUNK_ROOT_DIR/config                  %{datapath}/
cp -r $TRUNK_ROOT_DIR/src                     %{datapath}/
chmod +x %{datapath}/bin/*.sh

%post

%postun
rm -rf %{datapath}/

%files
%defattr(-,ads,ads)
/www/monitor_plat

%debug_package %{nil}
%changelog
* Wed Jul 30 2018 liyanguo <lyg@meitu.com>
- create this spec file