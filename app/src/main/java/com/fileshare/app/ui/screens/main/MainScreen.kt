package com.fileshare.app.ui.screens.main

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.fileshare.app.domain.model.Category
import com.fileshare.app.domain.model.Document
import com.fileshare.app.util.FileUtils
import com.fileshare.app.viewmodel.CategoryViewModel
import com.fileshare.app.viewmodel.DocumentViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    documentViewModel: DocumentViewModel,
    categoryViewModel: CategoryViewModel,
    onNavigateToDetail: (Long) -> Unit,
    onNavigateToAdd: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val documents by documentViewModel.documents.collectAsState()
    val selectedCategoryId by documentViewModel.selectedCategoryId.collectAsState()
    val searchQuery by documentViewModel.searchQuery.collectAsState()
    val categories by categoryViewModel.categories.collectAsState()
    val context = LocalContext.current
    var showSearchBar by remember { mutableStateOf(false) }
    
    var selectionMode by remember { mutableStateOf(false) }
    val selectedDocuments = remember { mutableStateListOf<Long>() }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Text(
                        "FileShare",
                        style = MaterialTheme.typography.titleLarge
                    ) 
                },
                actions = {
                    if (selectionMode) {
                        IconButton(onClick = {
                            if (selectedDocuments.isNotEmpty()) {
                                val filePaths = documents
                                    .filter { it.id in selectedDocuments }
                                    .flatMap { it.imageUris }
                                FileUtils.shareMultipleFiles(context, filePaths)
                            }
                            selectionMode = false
                            selectedDocuments.clear()
                        }) {
                            Icon(Icons.Default.Share, "공유하기")
                        }
                        IconButton(onClick = {
                            selectionMode = false
                            selectedDocuments.clear()
                        }) {
                            Icon(Icons.Default.Close, "취소")
                        }
                    } else {
                        IconButton(onClick = { showSearchBar = !showSearchBar }) {
                            Icon(Icons.Default.Search, "검색")
                        }
                        IconButton(onClick = { onNavigateToSettings() }) {
                            Icon(Icons.Default.Settings, "설정")
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        },
        floatingActionButton = {
            if (!selectionMode) {
                FloatingActionButton(
                    onClick = onNavigateToAdd,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ) {
                    Icon(Icons.Default.Add, "문서 추가")
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp) // 전체적인 여백 추가
        ) {
            // Search Bar
            if (showSearchBar) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { documentViewModel.updateSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    placeholder = { Text("제목 또는 메모 검색") },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { documentViewModel.clearSearch() }) {
                                Icon(Icons.Default.Close, "검색 초기화")
                            }
                        }
                    },
                    singleLine = true,
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                        unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f)
                    )
                )
            }
            
            // Category Filter
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedCategoryId == null,
                        onClick = { documentViewModel.selectCategory(null) },
                        label = { Text("전체") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    )
                }
                items(categories) { category ->
                    FilterChip(
                        selected = selectedCategoryId == category.id,
                        onClick = { documentViewModel.selectCategory(category.id) },
                        label = { Text(category.name) },
                         colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Document List
            if (documents.isEmpty()) {
                EmptyState(onAddDocument = onNavigateToAdd)
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 80.dp), // FAB 가리지 않게 하단 여백
                    verticalArrangement = Arrangement.spacedBy(16.dp) // 카드 간 간격 넓힘
                ) {
                    item {
                        if (!selectionMode && documents.isNotEmpty()) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                TextButton(
                                    onClick = { selectionMode = true }
                                ) {
                                    Icon(Icons.Default.CheckCircle, "선택 모드", modifier = Modifier.size(18.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("편집", style = MaterialTheme.typography.labelLarge)
                                }
                            }
                        }
                    }
                    
                    items(documents, key = { it.id }) { document ->
                        val category = categories.find { it.id == document.categoryId }
                        DocumentCard(
                            document = document,
                            categoryName = category?.name,
                            selectionMode = selectionMode,
                            isSelected = document.id in selectedDocuments,
                            onClick = {
                                if (selectionMode) {
                                    if (document.id in selectedDocuments) {
                                        selectedDocuments.remove(document.id)
                                    } else {
                                        selectedDocuments.add(document.id)
                                    }
                                } else {
                                    onNavigateToDetail(document.id)
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyState(onAddDocument: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.FolderOpen, // 아이콘 변경
            contentDescription = null,
            modifier = Modifier.size(100.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
        )
        Spacer(Modifier.height(24.dp))
        Text(
            text = "문서를 추가해보세요",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "중요한 서류를 안전하게 보관하고\n필요할 때 바로 찾아보세요.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(Modifier.height(32.dp))
        Button(
            onClick = onAddDocument,
            shape = MaterialTheme.shapes.large,
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
        ) {
            Icon(Icons.Default.Add, null, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
            Text("문서 추가하기")
        }
    }
}

@Composable
fun DocumentCard(
    document: Document,
    categoryName: String?,
    selectionMode: Boolean,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val dateFormatter = remember { SimpleDateFormat("yyyy.MM.dd", Locale.getDefault()) }
    
    // 카드 스타일 변경: ElevatedCard
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = MaterialTheme.shapes.medium, // 둥근 모서리
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = if (isSelected) 
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
            else 
                MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp), // 내부 패딩 증가
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (selectionMode) {
                Checkbox(
                    checked = isSelected,
                    onCheckedChange = { onClick() },
                    modifier = Modifier.padding(end = 12.dp)
                )
            }
            
            // Thumbnail
            Card(
                shape = MaterialTheme.shapes.small,
                modifier = Modifier.size(64.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                 if (FileUtils.fileExists(document.fileUri)) {
                    AsyncImage(
                        model = java.io.File(document.fileUri),
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                         Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    }
                }
            }
            
            Spacer(Modifier.width(16.dp))
            
            // Document Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = document.title,
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.weight(1f)
                    )
                }
                
                Spacer(Modifier.height(4.dp))
                
                if (!document.memo.isNullOrBlank()) {
                     Text(
                        text = document.memo!!,
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                     Spacer(Modifier.height(8.dp))
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (categoryName != null) {
                        Surface(
                            color = MaterialTheme.colorScheme.secondaryContainer,
                            shape = MaterialTheme.shapes.extraSmall,
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text(
                                text = categoryName, 
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSecondaryContainer,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = dateFormatter.format(Date(document.updatedAt)),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
            }
            
            if (!selectionMode) {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
