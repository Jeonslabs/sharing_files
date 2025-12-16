package com.fileshare.app.ui.screens.settings

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import com.fileshare.app.domain.model.Category
import com.fileshare.app.viewmodel.CategoryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryManagementScreen(
    categoryViewModel: CategoryViewModel,
    onNavigateBack: () -> Unit
) {
    val categories by categoryViewModel.categories.collectAsState()
    var showAddCategoryDialog by remember { mutableStateOf(false) }
    var showEditCategoryDialog by remember { mutableStateOf<Category?>(null) }
    var showDeleteConfirmDialog by remember { mutableStateOf<Category?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("카테고리 관리") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "뒤로")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddCategoryDialog = true }
            ) {
                Icon(Icons.Default.Add, "카테고리 추가")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            itemsIndexed(categories) { index, category ->
                CategoryItem(
                    category = category,
                    isFirst = index == 0,
                    isLast = index == categories.size - 1,
                    onMoveUp = {
                        if (index > 0) {
                            val newList = categories.toMutableList()
                            val prev = newList[index - 1]
                            newList[index - 1] = category
                            newList[index] = prev
                            categoryViewModel.updateCategoryOrder(newList)
                        }
                    },
                    onMoveDown = {
                        if (index < categories.size - 1) {
                            val newList = categories.toMutableList()
                            val next = newList[index + 1]
                            newList[index + 1] = category
                            newList[index] = next
                            categoryViewModel.updateCategoryOrder(newList)
                        }
                    },
                    onEdit = { showEditCategoryDialog = category },
                    onDelete = { showDeleteConfirmDialog = category }
                )
                HorizontalDivider()
            }
        }
    }

    // Add Category Dialog
    if (showAddCategoryDialog) {
        var categoryName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddCategoryDialog = false },
            title = { Text("새 카테고리 추가") },
            text = {
                OutlinedTextField(
                    value = categoryName,
                    onValueChange = { categoryName = it },
                    label = { Text("카테고리 이름") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (categoryName.isNotBlank()) {
                            categoryViewModel.addCategory(categoryName)
                            showAddCategoryDialog = false
                        }
                    }
                ) {
                    Text("추가")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddCategoryDialog = false }) {
                    Text("취소")
                }
            }
        )
    }

    // Edit Category Dialog
    showEditCategoryDialog?.let { category ->
        var categoryName by remember { mutableStateOf(category.name) }
        AlertDialog(
            onDismissRequest = { showEditCategoryDialog = null },
            title = { Text("카테고리 수정") },
            text = {
                OutlinedTextField(
                    value = categoryName,
                    onValueChange = { categoryName = it },
                    label = { Text("카테고리 이름") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (categoryName.isNotBlank()) {
                            categoryViewModel.updateCategory(
                                category.copy(name = categoryName)
                            )
                            showEditCategoryDialog = null
                        }
                    }
                ) {
                    Text("저장")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditCategoryDialog = null }) {
                    Text("취소")
                }
            }
        )
    }

    // Delete Confirmation Dialog
    showDeleteConfirmDialog?.let { category ->
        AlertDialog(
            onDismissRequest = { showDeleteConfirmDialog = null },
            title = { Text("카테고리 삭제") },
            text = {
                if (category.isDefault) {
                    Text("기본 카테고리는 삭제할 수 없습니다.")
                } else {
                    Text("'${category.name}' 카테고리를 삭제하시겠습니까?")
                }
            },
            confirmButton = {
                if (!category.isDefault) {
                    TextButton(
                        onClick = {
                            categoryViewModel.deleteCategory(category)
                            showDeleteConfirmDialog = null
                        }
                    ) {
                        Text("삭제")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirmDialog = null }) {
                    Text(if (category.isDefault) "확인" else "취소")
                }
            }
        )
    }
}

@Composable
private fun CategoryItem(
    category: Category,
    isFirst: Boolean,
    isLast: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    ListItem(
        headlineContent = { Text(category.name) },
        leadingContent = {
            Icon(Icons.Default.Category, null)
        },
        supportingContent = {
            if (category.isDefault) {
                Text("기본 카테고리", style = MaterialTheme.typography.bodySmall)
            }
        },
        trailingContent = {
            Row {
                IconButton(
                    onClick = onMoveUp,
                    enabled = !isFirst
                ) {
                    Icon(Icons.Default.ArrowUpward, "위로 이동")
                }
                IconButton(
                    onClick = onMoveDown,
                    enabled = !isLast
                ) {
                    Icon(Icons.Default.ArrowDownward, "아래로 이동")
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, "수정")
                }
                IconButton(
                    onClick = onDelete,
                    enabled = !category.isDefault
                ) {
                    Icon(
                        Icons.Default.Delete,
                        "삭제",
                        tint = if (category.isDefault)
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        else
                            MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    )
}
